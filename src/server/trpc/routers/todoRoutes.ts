import * as v from "valibot";
import { publicProcedure } from "../initTrpc";
import { TRPCError } from "@trpc/server";

enum Switch {
	tagGroup = 0,
	tag = 1,
}

export const AddTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				todo: v.string(),
				tagId: v.nullish(v.number()),
				tagGroup: v.string(),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const tagGroup = await ctx.db
			.selectFrom("tagGroups")
			.select(["id"])
			.where("tagGroup", "=", input.tagGroup)
			.executeTakeFirst();

		if (!tagGroup) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Tag group ${input.tagGroup} not found`,
			});
		}
		await ctx.db
			.insertInto("todos")
			.values({
				completed: false,
				projectId: input.projectId,
				todo: input.todo,
				dateId: null,
				hoursWorked: null,
				tagId: input.tagId,
				tagGroupId: tagGroup?.id,
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
				dateId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.updateTable("todos")
			.set({
				completed: true,
				hoursWorked: input.hoursWorked,
				dateId: input.dateId,
			})
			.where("id", "=", input.todoId)
			.executeTakeFirstOrThrow();

		return;
	});

export const editTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				id: v.number(),
				hoursWorked: v.number(),
				dateId: v.number(),
				todo: v.string(),
				tagId: v.number(),
				tagGroup: v.string(),
				completed: v.boolean(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const tagGroup = await ctx.db
			.selectFrom("tagGroups")
			.select(["id"])
			.where("tagGroup", "=", input.tagGroup)
			.executeTakeFirst();

		await ctx.db
			.updateTable("todos")
			.set({
				completed: input.completed,
				hoursWorked: input.hoursWorked,
				dateId: input.dateId,
				tagGroupId: tagGroup?.id,
				tagId: input.tagId,
				todo: input.todo,
			})
			.where("id", "=", input.id)
			.executeTakeFirstOrThrow();

		return;
	});
export const addTagOrGroup = publicProcedure
	.input(
		v.parser(
			v.object({
				nameOfTagOrGroup: v.string(),
				switch: v.enum(Switch),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		if (input.switch === Switch.tag) {
			await ctx.db
				.insertInto("tags")
				.values({
					tagActive: true,
					projectId: input.projectId,
					tag: input.nameOfTagOrGroup,
				})
				.executeTakeFirstOrThrow();
		}
		if (input.switch === Switch.tagGroup) {
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
				switch: v.enum(Switch),
				projectId: v.number(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		if (input.switch === Switch.tag) {
			await ctx.db
				.updateTable("tags")
				.set({
					tagActive: input.enable,
					projectId: input.projectId,
				})
				.executeTakeFirstOrThrow();
		}
		if (input.switch === Switch.tagGroup) {
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
				projectId: v.number(),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		const unDoneTodos = await ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "tagGroups.id", "tagGroupId")
			.innerJoin("tags", "tags.id", "tagId")
			.select([
				"todos.id",
				"todos.tagId",
				"todos.dateId",
				"tagGroups.tagGroup",
				"tags.tag",
			])
			.where("completed", "=", false)
			.where("projectId", "=", input.projectId)
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
		const doneTodos = await ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "tagGroups.id", "todos.tagGroupId")
			.innerJoin("tags", "tags.id", "todos.tagId")
			.innerJoin("dates", "dates.id", "todos.dateId")
			.select([
				"todos.id",
				"todos.tagId",
				"todos.dateId",
				"tagGroups.tagGroup",
				"tags.tag",
				"dates.date",
			])
			.where("completed", "=", true)
			.where("projectId", "=", input.projectId)
			.execute();

		if (doneTodos.length === 0) {
			return null;
		}

		const monthsTodosDone = doneTodos.filter(
			(e) =>
				e.date?.getFullYear() === input.year &&
				e.date.getMonth() === input.month,
		);

		return monthsTodosDone;
	});

// getAllDoneTodosPaginated
// getTagsWithActiveSwitch
// getTagGroupsWithActiveSwitch
