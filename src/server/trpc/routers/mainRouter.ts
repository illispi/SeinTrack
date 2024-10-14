import { sql } from "kysely";

import * as v from "valibot";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../initTrpc";

export const appRouter = router({
	test: publicProcedure.query(() => {
		// throw new TRPCError({ code: "NOT_FOUND" });
		return "hello";
	}),
	getHoursOfDay: publicProcedure
		.input(
			v.parser(v.object({ dates: v.array(v.date()), projectName: v.string() })),
		)
		.query(async ({ input, ctx }) => {
			const projectId = await ctx.db
				.selectFrom("projects")
				.select(["id"])
				.where("name", "=", input.projectName);
			const hoursArr = [];
			for (let index = 0; index < input.dates.length; index++) {
				const hours = await ctx.db
					.selectFrom("dates")
					.select("hoursWorked")
					.where("projectId", "=", projectId)
					.where("date", "=", input.dates[index])
					.executeTakeFirst();

				if (!hours) {
					hoursArr.push({ date: input.dates[index], hours: null });
				} else {
					hoursArr.push({ date: input.dates[index], hours: hours.hoursWorked });
				}
			}

			return hoursArr;
		}),
	changeDayHours: publicProcedure
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
				.where("name", "=", input.projectName);
			const exists = await ctx.db
				.selectFrom("dates")
				.select(["date"])
				.where("date", "=", input.date)
				.executeTakeFirst();
			if (exists) {
				const hours = await ctx.db
					.updateTable("dates")
					.set({ hoursWorked: input.hours })
					.where("date", "=", input.date)
					.executeTakeFirst();
			} else {
				const hours = await ctx.db
					.insertInto("dates")
					.values({ date: input.date, hoursWorked: input.hours, projectId })
					.execute();
			}
			return;
		}),
	createProject: createProject,
});

export type IAppRouter = typeof appRouter;

//BUG Does mutations need to return anything or do they leak memory like this without one?
