import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { adjustDateByOne } from "~/utils/functionsAndVariables";
import { publicProcedure } from "../initTrpc";

export const AddTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				todo: v.pipe(
					v.string(),
					v.trim(),
					v.maxLength(800),
					v.minLength(3),
					v.nonEmpty(),
				),
				tagId: v.nullish(v.number()),
				tagGroupId: v.number(),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.insertInto("todos")
			.values({
				completed: false,
				projectId: input.projectId,
				todo: input.todo,
				dateCompleted: null,
				hoursWorked: null,
				tagId: input.tagId,
				tagGroupId: input.tagGroupId,
			})
			.executeTakeFirstOrThrow();

		return;
	});
export const completeTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				todoId: v.number(),
				hoursWorked: v.number(),
				date: v.date(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.updateTable("todos")
			.set({
				completed: true,
				hoursWorked: input.hoursWorked,
				dateCompleted: input.date,
			})
			.where("id", "=", input.todoId)
			.executeTakeFirstOrThrow();

		return;
	});

export const editTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				todoId: v.number(),
				hoursWorked: v.nullish(v.number()),
				todo: v.pipe(
					v.string(),
					v.trim(),
					v.maxLength(800),
					v.minLength(3),
					v.nonEmpty(),
				),
				tagId: v.nullish(v.number()),
				tagGroupId: v.number(),
				completed: v.nullish(v.boolean()),
				dateCompleted: v.nullish(v.date()),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.updateTable("todos")
			.set({
				completed: input.completed,
				hoursWorked: input.hoursWorked,
				tagGroupId: input.tagGroupId,
				tagId: input.tagId,
				todo: input.todo,
				dateCompleted: input.dateCompleted,
			})
			.where("id", "=", input.todoId)
			.executeTakeFirstOrThrow();

		return;
	});
export const addTagOrGroup = publicProcedure
	.input(
		v.parser(
			v.object({
				nameOfTagOrGroup: v.pipe(
					v.string(),
					v.trim(),
					v.toLowerCase(),
					v.nonEmpty(),
					v.maxLength(50),
					v.minLength(3),
				),
				switch: v.union([v.literal("tag"), v.literal("tagGroup")]),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		if (input.switch === "tag") {
			const existsAlready = await ctx.db
				.selectFrom("tags")
				.select("tag")
				.where("tag", "=", input.nameOfTagOrGroup)
				.where("projectId", "=", input.projectId)
				.executeTakeFirst();

			if (existsAlready) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Tag ${input.nameOfTagOrGroup} exists already`,
				});
			}
			await ctx.db
				.insertInto("tags")
				.values({
					tagActive: true,
					projectId: input.projectId,
					tag: input.nameOfTagOrGroup,
				})
				.executeTakeFirstOrThrow();
		}
		if (input.switch === "tagGroup") {
			await ctx.db
				.insertInto("tagGroups")
				.values({
					tagGroupActive: true,
					tagGroup: input.nameOfTagOrGroup,
				})
				.executeTakeFirstOrThrow();
		}
		return;
	});
export const toggleTagOrGroupActivation = publicProcedure
	.input(
		v.parser(
			v.object({
				enable: v.boolean(),
				switch: v.union([v.literal("tag"), v.literal("tagGroup")]),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		if (input.switch === "tag") {
			await ctx.db
				.updateTable("tags")
				.set({
					tagActive: input.enable,
					projectId: input.projectId,
				})
				.executeTakeFirstOrThrow();
		}
		if (input.switch === "tagGroup") {
			await ctx.db
				.updateTable("tagGroups")
				.set({
					tagGroupActive: input.enable,
				})
				.executeTakeFirstOrThrow();
		}
		return;
	});
export const getUnDoneTodos = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.nullish(v.number()),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		if (!input.projectId) {
			throw new TRPCError({ code: "BAD_REQUEST" });
		}
		const unDoneTodos = await ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "tagGroups.id", "todos.tagGroupId")
			.leftJoin("tags", "tags.id", "todos.tagId")
			.select([
				"todos.id",
				"todos.tagId",
				"todos.todo",
				"tagGroups.tagGroup",
				"tags.tag",
			])
			.where("todos.completed", "=", false)
			.where("todos.projectId", "=", input.projectId)
			.execute();

		if (unDoneTodos.length === 0) {
			return null;
		}

		return unDoneTodos;
	});
export const getDoneTodosByMonth = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				month: v.number(),
				year: v.number(),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		const nextMonth = adjustDateByOne(input.year, input.month, true);
		const doneTodos = await ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "tagGroups.id", "todos.tagGroupId")
			.leftJoin("tags", "tags.id", "todos.tagId")
			.select([
				"todos.todo",
				"todos.id",
				"todos.tagId",
				"tagGroups.tagGroup",
				"tags.tag",
				"todos.hoursWorked",
				"todos.dateCompleted",
			])
			.where("todos.completed", "=", true)
			.where("todos.projectId", "=", input.projectId)
			.where("dateCompleted", ">=", new Date(input.year, input.month, 1))
			.where("dateCompleted", "<", new Date(nextMonth.year, nextMonth.month, 1))
			.orderBy("todos.dateCompleted")
			.execute();

		if (doneTodos.length === 0) {
			return null;
		}

		return doneTodos;
	});

export const getTagsOrGroupsActiveOrNot = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.nullish(v.number()),
				switch: v.union([v.literal("tag"), v.literal("tagGroup")]),
				active: v.boolean(),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		if (!input.projectId) {
			throw new TRPCError({ code: "BAD_REQUEST" });
		}
		if (input.switch === "tag") {
			const activeTags = await ctx.db
				.selectFrom("tags")
				.select(["id", "tag"])
				.where("tags.projectId", "=", input.projectId)
				.where("tagActive", "=", input.active)
				.where("tag", "is not", null)
				.execute();

			if (activeTags.length === 0) {
				return null;
			}
			return activeTags;
		}
		if (input.switch === "tagGroup") {
			const activeTagGroups = await ctx.db
				.selectFrom("tagGroups")
				.select(["id", "tagGroup"])
				.where("tagGroupActive", "=", input.active)
				.execute();

			if (activeTagGroups.length === 0) {
				return null;
			}
			return activeTagGroups;
		}
	});

export const EditTagOrGroupName = publicProcedure
	.input(
		v.parser(
			v.object({
				name: v.pipe(
					v.string(),
					v.trim(),
					v.maxLength(800),
					v.minLength(3),
					v.nonEmpty(),
				),
				switch: v.union([v.literal("tag"), v.literal("tagGroup")]),
				tagId: v.nullish(v.number()),
				tagGroupId: v.nullish(v.number()),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		if (input.switch === "tag" && input.tagId) {
			await ctx.db
				.updateTable("tags")
				.set({ tag: input.name })
				.where("id", "=", input.tagId)
				.executeTakeFirstOrThrow();
		} else if (input.switch === "tagGroup" && input.tagGroupId) {
			await ctx.db
				.updateTable("tagGroups")
				.set({ tagGroup: input.name })
				.where("id", "=", input.tagGroupId)
				.executeTakeFirstOrThrow();
		}

		return;
	});
