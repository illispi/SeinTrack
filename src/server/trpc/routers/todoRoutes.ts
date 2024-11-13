import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { adjustDateByOne } from "~/utils/functionsAndVariables";
import { publicProcedure } from "../initTrpc";

export const addTodo = publicProcedure
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
				tagGroupId: v.number("You need to activate tag group and use it!"),
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
				hoursWorked: v.pipe(
					v.number("Add time to complete todo!"),
					v.minValue(0.1, "Add time to complete todo!"),
				),
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

export const deleteTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				todoId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.deleteFrom("todos")
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
				completed: v.boolean(),
				dateCompleted: v.nullish(v.date()),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.updateTable("todos")
			.set({
				completed: input.completed,
				hoursWorked: input.completed ? input.hoursWorked : null,
				tagGroupId: input.tagGroupId,
				tagId: input.tagId,
				todo: input.todo,
				dateCompleted: input.completed ? input.dateCompleted : null,
			})
			.where("todos.id", "=", input.todoId)
			.returningAll()
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
					projectId: input.projectId,
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
				filterTag: v.nullish(v.number()),
				filterTagGroup: v.nullish(v.number()),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		if (!input.projectId) {
			throw new TRPCError({ code: "BAD_REQUEST" });
		}
		let unDoneTodosSelect = ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "tagGroups.id", "todos.tagGroupId")
			.leftJoin("tags", "tags.id", "todos.tagId")
			.select([
				"todos.id",
				"todos.tagId",
				"todos.todo",
				"todos.tagGroupId",
				"tagGroups.tagGroup",
				"tags.tag",
			])
			.where("todos.completed", "=", false)
			.where("todos.projectId", "=", input.projectId)
			.orderBy("id asc");

		if (input.filterTag === null) {
			unDoneTodosSelect = unDoneTodosSelect.where("todos.tagId", "is", null);
		}
		if (input.filterTag) {
			unDoneTodosSelect = unDoneTodosSelect.where(
				"todos.tagId",
				"=",
				input.filterTag,
			);
		}
		if (input.filterTagGroup) {
			unDoneTodosSelect = unDoneTodosSelect.where(
				"todos.tagGroupId",
				"=",
				input.filterTagGroup,
			);
		}

		const unDoneTodos = await unDoneTodosSelect.execute();

		if (unDoneTodos.length === 0) {
			return null;
		}

		return unDoneTodos;
	});
export const doneTodosInf = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				month: v.nullable(v.number()),
				year: v.nullable(v.number()),
				cursor: v.nullish(v.number()),
				limit: v.pipe(v.number(), v.minValue(1), v.maxValue(100)),
				// direction: v.union([v.literal("forward"), v.literal("backward")]),
				tagId: v.nullish(v.number()),
				tagGroupId: v.nullable(v.number()),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		const cursor = input.cursor ? input.cursor : 0;

		let doneTodosPartial = ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "tagGroups.id", "todos.tagGroupId")
			.leftJoin("tags", "tags.id", "todos.tagId")
			.select([
				"todos.id",
				"todos.todo",
				"todos.tagId as tagId",
				"tagGroups.tagGroup",
				"tagGroups.id as tagGroupId",
				"tags.tag",
				"todos.hoursWorked",
				"todos.dateCompleted",
			])
			.select("tagGroups.id as tagGroupId")
			.where("todos.completed", "=", true)
			.where("todos.projectId", "=", input.projectId)
			.orderBy("todos.dateCompleted")
			.limit(input.limit)
			.offset(cursor * input.limit);

		if (input.year !== null) {
			if (input.month !== null) {
				const nextMonth = adjustDateByOne(input.year, input.month, true);
				doneTodosPartial = doneTodosPartial
					.where(
						"todos.dateCompleted",
						">=",
						new Date(input.year, input.month, 1),
					)
					.where(
						"todos.dateCompleted",
						"<",
						new Date(nextMonth.year, nextMonth.month, 1),
					);
			} else {
				doneTodosPartial = doneTodosPartial
					.where("todos.dateCompleted", ">=", new Date(input.year, 0, 1))
					.where("todos.dateCompleted", "<", new Date(input.year + 1, 0, 1));
			}
		}

		if (input.tagId) {
			doneTodosPartial = doneTodosPartial.where(
				"todos.tagId",
				"=",
				input.tagId,
			);
		}
		if (input.tagId === null) {
			doneTodosPartial = doneTodosPartial.where("todos.tagId", "is", null);
		}
		if (input.tagGroupId) {
			doneTodosPartial = doneTodosPartial.where(
				"todos.tagGroupId",
				"=",
				input.tagGroupId,
			);
		}

		const doneTodos = await doneTodosPartial.execute();

		if (doneTodos.length === 0) {
			return null;
		}

		let nextCursor: typeof input.cursor | undefined = undefined;

		if (doneTodos.length === input.limit) {
			nextCursor = cursor + 1;
		}
		return { doneTodos: doneTodos, nextCursor };
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
		//TODO why not just rquire projectID????
		if (!input.projectId) {
			throw new TRPCError({ code: "BAD_REQUEST" });
		}
		if (input.switch === "tag") {
			const activeTags = await ctx.db
				.selectFrom("tags")
				.select(["id", "tag", "projectId", "tagActive"])
				.where("tags.projectId", "=", input.projectId)
				.where("tagActive", "=", input.active)
				.where("tag", "is not", null)
				.orderBy("id asc")
				.execute();

			if (activeTags.length === 0) {
				return null;
			}
			return activeTags;
		}
		if (input.switch === "tagGroup") {
			const activeTagGroups = await ctx.db
				.selectFrom("tagGroups")
				.select(["id", "tagGroup", "tagGroupActive"])
				.where("tagGroupActive", "=", input.active)
				.where("projectId", "=", input.projectId)
				.orderBy("id asc")
				.execute();

			if (activeTagGroups.length === 0) {
				return null;
			}
			return activeTagGroups;
		}
	});

export const getAllTags = publicProcedure
	.input(v.parser(v.object({ projectId: v.number() })))
	.query(async ({ ctx, input }) => {
		const tags = await ctx.db
			.selectFrom("tags")
			.select(["id", "tag", "projectId", "tagActive"])
			.where("tags.projectId", "=", input.projectId)
			.where("tag", "is not", null)
			.orderBy("id asc")
			.execute();

		if (tags.length === 0) {
			return null;
		}
		return tags;
	});

export const getAllTagGroups = publicProcedure
	.input(v.parser(v.object({ projectId: v.number() })))
	.query(async ({ ctx, input }) => {
		const activeTagGroups = await ctx.db
			.selectFrom("tagGroups")
			.select(["id", "tagGroup", "tagGroupActive"])
			.where("projectId", "=", input.projectId)
			.orderBy("id asc")
			.execute();

		if (activeTagGroups.length === 0) {
			return null;
		}
		return activeTagGroups;
	});

export const toggleTagActive = publicProcedure
	.input(
		v.parser(
			v.object({
				tagId: v.number(),
				setActive: v.boolean(),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.updateTable("tags")
			.set({ tagActive: input.setActive })
			.where("id", "=", input.tagId)
			.executeTakeFirstOrThrow();
	});
export const toggleTagGroupActive = publicProcedure
	.input(
		v.parser(
			v.object({
				tagGroupId: v.number(),
				setActive: v.boolean(),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.updateTable("tagGroups")
			.set({ tagGroupActive: input.setActive })
			.where("id", "=", input.tagGroupId)
			.executeTakeFirstOrThrow();
	});

export const editTagOrGroupName = publicProcedure
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
