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

		const tagId = input.tag
			? await ctx.db
					.selectFrom("tags")
					.select(["id"])
					.where("tag", "=", input.tag)
					.executeTakeFirst()
			: null;
		const tagGroupId = await ctx.db
			.selectFrom("tagGroups")
			.select(["id"])
			.where("tagGroup", "=", input.tagGroup)
			.executeTakeFirst();

		if (!tagGroupId) {
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
				tagId: tagId?.id,
				tagGroupId: tagGroupId?.id,
			})
			.executeTakeFirstOrThrow();

		return;
	});
export const completeTodo = publicProcedure
	.input(
		v.parser(
			v.object({
				id: v.number(),
				project: v.string(),
				hoursWorked: v.number(),
				date: v.date(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const dateId = await ctx.db
			.selectFrom("dates")
			.select(["id"])
			.where("date", "=", input.date)
			.executeTakeFirstOrThrow();

		await ctx.db
			.updateTable("todos")
			.set({
				completed: true,
				hoursWorked: input.hoursWorked,
				dateId: dateId.id,
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
				project: v.string(),
				hoursWorked: v.number(),
				date: v.date(),
			}),
		),
	)
	.mutation(async ({ input, ctx }) => {
		const dateId = await ctx.db
			.selectFrom("dates")
			.select(["id"])
			.where("date", "=", input.date)
			.executeTakeFirstOrThrow();

		await ctx.db
			.updateTable("todos")
			.set({
				completed: true,
				hoursWorked: input.hoursWorked,
				dateId: dateId.id,
			})
			.where("id", "=", input.id)
			.executeTakeFirstOrThrow();

		return;
	});
// export const editTodo
// export const addTodoGroup
// export const toggleActivationTodo
// export const toggleActivationTodoGroup
