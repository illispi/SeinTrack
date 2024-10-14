import { publicProcedure } from "../initTrpc";
import * as v from "valibot";

export const editProject = publicProcedure
	.input(v.parser(v.object({ name: v.string(), hoursTarget: v.number() })))
	.mutation(async ({ input, ctx }) => {
		const existsId = await ctx.db
			.selectFrom("projects")
			.select(["id"])
			.where("projects.name", "=", input.name)
			.executeTakeFirst();
		if (!existsId) {
			await ctx.db
				.insertInto("projects")
				.values({ name: input.name, targetHours: input.hoursTarget })
				.execute();
		} else {
			await ctx.db
				.updateTable("projects")
				.where("id", "=", existsId.id)
				.set({ name: input.name, targetHours: input.hoursTarget })
				.execute();
		}
		return;
	});

export const allProjects = publicProcedure.query(async ({ ctx }) => {
	const projects = await ctx.db
		.selectFrom("projects")
		.select(["name", "targetHours"])
		.execute();
	if (projects.length === 0) {
		return null;
	}
	return projects;
});
