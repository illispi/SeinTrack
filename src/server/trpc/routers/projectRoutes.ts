import * as v from "valibot";
import { publicProcedure } from "../initTrpc";

export const newProject = publicProcedure
	.input(
		v.parser(
			v.object({
				name: v.string(),
				hoursTarget: v.number(),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.insertInto("projects")
			.values({ name: input.name, targetHours: input.hoursTarget })
			.executeTakeFirstOrThrow();

		const project = await ctx.db
			.selectFrom("projects")
			.select("id")
			.where("projects.name", "=", input.name)
			.executeTakeFirstOrThrow();

		for (let index = 0; index < 5; index++) {
			await ctx.db
				.insertInto("countedDays")
				.values({ day: index + 1, projectId: project.id })
				.executeTakeFirstOrThrow();
		}

		return;
	});

export const editProject = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				name: v.string(),
				hoursTarget: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.updateTable("projects")
			.where("id", "=", input.projectId)
			.set({ name: input.name, targetHours: input.hoursTarget })
			.executeTakeFirstOrThrow();
		return;
	});

export const allProjects = publicProcedure.query(async ({ ctx }) => {
	const projects = await ctx.db
		.selectFrom("projects")
		.select(["name", "targetHours", "id"])
		.execute();
	if (projects.length === 0) {
		return null;
	}
	return projects;
});

export const editActiveDays = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				activeDays: v.pipe(
					v.array(v.pipe(v.number(), v.minValue(0), v.maxValue(6))),
					v.minLength(1),
					v.maxLength(7),
				),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		//NOTE does this delete all of them at once
		await ctx.db
			.deleteFrom("countedDays")
			.where("projectId", "=", input.projectId)
			.execute();

		for (const day of input.activeDays) {
			await ctx.db
				.insertInto("countedDays")
				.values({ day: day, projectId: input.projectId })
				.executeTakeFirstOrThrow();
		}
		return;
	});

export const getActiveDays = publicProcedure
	.input(v.parser(v.number()))
	.query(async ({ ctx, input }) => {
		const activeDays = await ctx.db
			.selectFrom("countedDays")
			.select("countedDays.day")
			.where("projectId", "=", input)
			.execute();

		//NOTE It cant be empty array so no check

		return activeDays;
	});
