import { sql } from "kysely";
import { publicProcedure, router } from "./utils/context";

import * as v from "valibot";

export const appRouter = router({
	test: publicProcedure.query(() => {
		return {
			message: "hello world",
		};
	}),
	getHoursOfDay: publicProcedure
		.input(v.parser(v.array(v.date())))
		.query(async ({ input, ctx }) => {
			const hoursArr = [];

			for (let index = 0; index < input.length; index++) {
				const hours = await ctx.db
					.selectFrom("date")
					.select("hoursWorked")
					.where("date", "=", input[index])
					.executeTakeFirst();

				if (!hours) {
					hoursArr.push({ date: input[index], hours: null });
				} else {
					hoursArr.push({ date: input[index], hours: null });
				}
			}

			return hoursArr;
		}),
	changeDayHours: publicProcedure
		.input(v.parser(v.object({ date: v.date(), hours: v.number() })))
		.mutation(async ({ input, ctx }) => {
			const hours = await ctx.db
				.updateTable("date")
				.set({ hoursWorked: input.hours })
				.where("date", "=", input.date)
				.executeTakeFirst();
		}),
});

export type IAppRouter = typeof appRouter;
