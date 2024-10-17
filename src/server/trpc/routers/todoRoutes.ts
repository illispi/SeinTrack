import * as v from "valibot";
import { publicProcedure } from "../initTrpc";
import { TRPCError } from "@trpc/server";

export const AddTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				todo: v.string(),
				tag: v.nullish(v.string()),
				tagGroup: v.string(),
				project: v.string(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const existsId = await ctx.db
			.selectFrom("projects")
			.select(["id"])
			.where("projects.name", "=", input.project)
			.executeTakeFirstOrThrow();

		const tag = input.tag
			? await ctx.db
					.selectFrom("tags")
					.select(["id"])
					.where("tag", "=", input.tag)
					.executeTakeFirst()
			: null;
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
				projectId: existsId.id,
				todo: input.todo,
				dateId: null,
				hoursWorked: null,
				tagId: tag?.id,
				tagGroupId: tagGroup?.id,
			})
			.executeTakeFirstOrThrow();

		return;
	});
export const completeTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				id: v.number(),
				hoursWorked: v.number(),
				date: v.date(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const date = await ctx.db
			.selectFrom("dates")
			.select(["id"])
			.where("date", "=", input.date)
			.executeTakeFirstOrThrow();

		await ctx.db
			.updateTable("todos")
			.set({
				completed: true,
				hoursWorked: input.hoursWorked,
				dateId: date.id,
			})
			.where("id", "=", input.id)
			.executeTakeFirstOrThrow();

		return;
	});

export const editTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				id: v.number(),
				hoursWorked: v.number(),
				date: v.date(),
				todo: v.string(),
				tag: v.nullish(v.string()),
				tagGroup: v.string(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const date = await ctx.db
			.selectFrom("dates")
			.select(["id"])
			.where("date", "=", input.date)
			.executeTakeFirstOrThrow();

		const tag = input.tag
			? await ctx.db
					.selectFrom("tags")
					.select(["id"])
					.where("tag", "=", input.tag)
					.executeTakeFirst()
			: null;
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
				dateId: date.id,
				tagGroupId: tagGroup?.id,
				tagId: tag?.id,
				todo: input.todo,
			})
			.where("id", "=", input.id)
			.executeTakeFirstOrThrow();

		return;
	});
// export const addTodoGroup
// export const toggleActivationTodo
// export const toggleActivationTodoGroup
