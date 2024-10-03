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
			for (let index = 0; index < input.length; index++) {
				const hoursArr = [];
				const hours = await ctx.db
					.selectFrom("date")
					.select("hoursWorked")
					.where("date", "=", input[index])
					.executeTakeFirst();

				if (hours === undefined) {
					hoursArr.push(null);
				} else {
					hoursArr.push(hours.hoursWorked);
				}
			}
		}),
});

export type IAppRouter = typeof appRouter;
