import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { publicProcedure } from "../initTrpc";

export const getHoursOfDay = publicProcedure
	.input(
		v.parser(v.object({ dates: v.array(v.date()), projectId: v.number() })),
	)
	.query(async ({ input, ctx }) => {
		const hoursArr = [];
		for (let index = 0; index < input.dates.length; index++) {
			const hours = await ctx.db
				.selectFrom("dates")
				.select("hoursWorked")
				.where("projectId", "=", input.projectId)
				.where("date", "=", input.dates[index])
				.executeTakeFirst();

			if (!hours) {
				hoursArr.push({ date: input.dates[index], hours: null });
			} else {
				hoursArr.push({ date: input.dates[index], hours: hours.hoursWorked });
			}
		}
		return hoursArr;
	});

export const getHoursForDate = publicProcedure
	.input(v.parser(v.object({ date: v.date(), projectId: v.number() })))
	.query(async ({ input, ctx }) => {
		const hours = await ctx.db
			.selectFrom("dates")
			.select("hoursWorked")
			.where("projectId", "=", input.projectId)
			.where("date", "=", input.date)
			.executeTakeFirst();
		if (!hours) {
			return null;
		}

		return hours;
	});

export const zeroTimer = publicProcedure
	.input(
		v.parser(
			v.object({
				date: v.date(),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const exists = await ctx.db
			.selectFrom("dates")
			.select(["date", "dates.hoursWorked"])
			.where("date", "=", input.date)
			.executeTakeFirst();


		if (exists) {
			await ctx.db
				.updateTable("dates")
				.set({ hoursWorked: null })
				.where("date", "=", input.date)
				.executeTakeFirst();
		} else {
			await ctx.db
				.insertInto("dates")
				.values({
					date: input.date,
					hoursWorked: null,
					projectId: input.projectId,
				})
				.execute();
		}
		return;
	});

export const changeDayHours = publicProcedure
	.input(
		v.parser(
			v.object({
				date: v.date(),
				hours: v.number(),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const exists = await ctx.db
			.selectFrom("dates")
			.select(["date", "dates.hoursWorked"])
			.where("date", "=", input.date)
			.where("projectId", "=", input.projectId)
			.executeTakeFirst();
		if (exists) {
			if (!exists.hoursWorked) {
				await ctx.db
					.updateTable("dates")
					.set({ hoursWorked: input.hours <= 0 ? 0 : input.hours })
					.where("date", "=", input.date)
					.where("projectId", "=", input.projectId)
					.executeTakeFirst();
				return;
			}
			if (exists.hoursWorked + input.hours > 24) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Hours exceed 24 hours",
				});
			}
			const hours = exists.hoursWorked + input.hours;
			await ctx.db
				.updateTable("dates")
				.set({ hoursWorked: hours <= 0 ? null : hours })
				.where("date", "=", input.date)
				.where("projectId", "=", input.projectId)
				.executeTakeFirst();
		} else {
			await ctx.db
				.insertInto("dates")
				.values({
					date: input.date,
					hoursWorked: input.hours,
					projectId: input.projectId,
				})
				.execute();
		}
		return;
	});
export const getFirstAndLastDate = publicProcedure
	.input(v.parser(v.object({ projectId: v.number() })))
	.query(async ({ input, ctx }) => {
		const dates = await ctx.db
			.selectFrom("dates")
			.select(["date"])
			.where("hoursWorked", "is not", null)
			.where("projectId", "=", input.projectId)
			.orderBy("date asc")
			.execute();

		if (dates.length > 0) {
			const dateFL = {
				firstDate: dates[0].date,
				lastDate: dates[dates.length - 1].date,
			};

			if (dateFL.firstDate && dateFL.lastDate) {
				return dateFL;
			}

			return null;
		}

		return null;
	});
