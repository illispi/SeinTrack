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
					.selectFrom("dateRows")
					.select("hoursWorked")
					.where("dates", "=", input[index])
					.executeTakeFirst();

				if (!hours) {
					hoursArr.push({ date: input[index], hours: null });
				} else {
					hoursArr.push({ date: input[index], hours: hours.hoursWorked });
				}
			}

			return hoursArr;
		}),
	changeDayHours: publicProcedure
		.input(v.parser(v.object({ date: v.date(), hours: v.number() })))
		.mutation(async ({ input, ctx }) => {
			const exists = await ctx.db
				.selectFrom("dateRows")
				.select(["dates"])
				.where("dates", "=", input.date)
				.executeTakeFirst();
			if (exists) {
				const hours = await ctx.db
					.updateTable("dateRows")
					.set({ hoursWorked: input.hours })
					.where("dates", "=", input.date)
					.executeTakeFirst();
			} else {
				const hours = await ctx.db
					.insertInto("dateRows")
					.values({ dates: input.date, hoursWorked: input.hours })
					.execute();
			}
		}),
});

export type IAppRouter = typeof appRouter;
