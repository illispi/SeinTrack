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

		const defaultGroups = [
			"bug fix",
			"feature",
			"major feature",
			"docs",
			"content",
			"refactor",
			"learning",
		];

		for (const group of defaultGroups) {
			await ctx.db
				.insertInto("tagGroups")
				.values({
					tagGroup: group,
					tagGroupActive: true,
					projectId: project.id,
					
				})
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
				active: v.boolean(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.updateTable("projects")
			.where("id", "=", input.projectId)
			.set({
				name: input.name,
				targetHours: input.hoursTarget,
				active: input.active,
			})
			.executeTakeFirstOrThrow();
		return;
	});

export const allProjects = publicProcedure.query(async ({ ctx }) => {
	const projects = await ctx.db
		.selectFrom("projects")
		.select(["name", "targetHours", "id", "active"])
		.orderBy("id asc")
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

export const getTargetHours = publicProcedure
	.input(v.parser(v.number()))
	.query(async ({ ctx, input }) => {
		const activeDays = await ctx.db
			.selectFrom("projects")
			.select("targetHours")
			.where("id", "=", input)
			.executeTakeFirstOrThrow();

		return activeDays;
	});

export const editTargetHours = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				targetHours: v.pipe(v.number(), v.minValue(0.1), v.maxValue(23)),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.updateTable("projects")
			.set({ targetHours: input.targetHours })
			.where("id", "=", input.projectId)
			.executeTakeFirstOrThrow();
		return;
	});
