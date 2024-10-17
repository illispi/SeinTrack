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
				completed: true,
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
