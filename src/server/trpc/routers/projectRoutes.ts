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
		const project = await ctx.db
			.insertInto("projects")
			.values({
				name: input.name,
				targetHours: input.hoursTarget,
				userId: ctx.id,
			})
			.returning("projects.id")
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

		const defaultTags = ["backend", "frontend"];

		for (const tag of defaultTags) {
			await ctx.db
				.insertInto("tags")
				.values({ projectId: project.id, tagActive: true, tag })
				.executeTakeFirstOrThrow();
		}

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

		const defaultProject = await ctx.db
			.selectFrom("projects")
			.select("default")
			.where("default", "=", true)
			.where("userId", "=", ctx.id)
			.executeTakeFirst();

		if (!defaultProject?.default) {
			await ctx.db
				.updateTable("projects")
				.set({ default: true })
				.where("id", "=", project.id)
				.executeTakeFirstOrThrow();
		}

		return;
	});

export const setDefault = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		ctx.db
			.updateTable("projects")
			.set({ default: false })
			.where("default", "=", true)
			.executeTakeFirstOrThrow();

		await ctx.db
			.updateTable("projects")
			.where("id", "=", input.projectId)
			.set({
				default: true,
			})
			.executeTakeFirstOrThrow();
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
		const atLeastOneActive = await ctx.db
			.selectFrom("projects")
			.select("id")
			.where("active", "=", true)
			.execute();

		if (atLeastOneActive.length <= 1 && input.active === false) {
			return;
		}

		await ctx.db
			.updateTable("projects")
			.where("id", "=", input.projectId)
			.set({
				name: input.name,
				targetHours: input.hoursTarget,
				active: input.active,
			})
			.executeTakeFirstOrThrow();
		let defaultActive;
		if (input.active === false) {
			defaultActive = await ctx.db
				.selectFrom("projects")
				.select(["id", "active", "default"])
				.where("default", "=", true)
				.executeTakeFirstOrThrow();
		} else {
			defaultActive = await ctx.db
				.selectFrom("projects")
				.select(["id", "active", "default"])
				.where("default", "=", true)
				.where("id", "!=", input.projectId)
				.executeTakeFirstOrThrow();
		}

		if (!defaultActive.active) {
			await ctx.db
				.updateTable("projects")
				.set({ default: false })
				.where("id", "=", input.projectId)
				.executeTakeFirstOrThrow();
			const first = await ctx.db
				.selectFrom("projects")
				.select("id")
				.where("active", "=", true)
				.executeTakeFirstOrThrow();
			await ctx.db
				.updateTable("projects")
				.set({ default: true })
				.where("active", "=", true)
				.where("id", "=", first.id)
				.executeTakeFirstOrThrow();
		}
		return;
	});

export const allProjects = publicProcedure.query(async ({ ctx }) => {
	const projects = await ctx.db
		.selectFrom("projects")
		.select(["name", "targetHours", "id", "active", "default"])
		.where("userId", "=", ctx.id)
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
