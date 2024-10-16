import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../initTrpc";
import * as v from "valibot";

export const getHoursOfDay = publicProcedure
	.input(
		v.parser(v.object({ dates: v.array(v.date()), projectName: v.string() })),
	)
	.query(async ({ input, ctx }) => {
		const projectId = await ctx.db
			.selectFrom("projects")
			.select(["id"])
			.where("name", "=", input.projectName)
			.executeTakeFirst();
		if (!projectId) {
			return null;
		}
		const hoursArr = [];
		for (let index = 0; index < input.dates.length; index++) {
			const hours = await ctx.db
				.selectFrom("dates")
				.select("hoursWorked")
				.where("projectId", "=", projectId?.id)
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
export const changeDayHours = publicProcedure
	.input(
		v.parser(
			v.object({
				date: v.date(),
				hours: v.number(),
				projectName: v.string(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const projectId = await ctx.db
			.selectFrom("projects")
			.select(["id"])
			.where("name", "=", input.projectName)
			.executeTakeFirst();

		if (!projectId) {
			return null;
		}
		const exists = await ctx.db
			.selectFrom("dates")
			.select(["date", "dates.hoursWorked"])
			.where("date", "=", input.date)
			.executeTakeFirst();
		if (exists) {
			if (!exists.hoursWorked) {
				await ctx.db
					.updateTable("dates")
					.set({ hoursWorked: input.hours <= 0 ? 0 : input.hours })
					.where("date", "=", input.date)
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
				.set({ hoursWorked: hours <= 0 ? 0 : hours })
				.where("date", "=", input.date)
				.executeTakeFirst();
		} else {
			await ctx.db
				.insertInto("dates")
				.values({
					date: input.date,
					hoursWorked: input.hours,
					projectId: projectId?.id,
				})
				.execute();
		}
		return;
	});
export const getFirstAndLastDate = publicProcedure
	.input(v.parser(v.string()))
	.query(async ({ input, ctx }) => {
		const projectId = await ctx.db
			.selectFrom("projects")
			.select(["id"])
			.where("name", "=", input)
			.executeTakeFirst();

		if (!projectId) {
			return null;
		}
		const dates = await ctx.db
			.selectFrom("dates")
			.select(["date"])
			.where("hoursWorked", "is not", null)
			.where("projectId", "=", projectId?.id)
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
