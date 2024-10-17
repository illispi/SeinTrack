import * as v from "valibot";
import { publicProcedure } from "../initTrpc";

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
			.executeTakeFirst();
		if (existsId) {
			await ctx.db
				.insertInto("todos")
				.values({
					completed: false,
					projectId: existsId.id,
					todo: input.todo,
					dateId: null,
					hoursWorked: null,
					tagId: input.tag,
				})
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
// export const editTodo
// export const completeTodo
// export const addTodoGroup
// export const toggleActivationTodo
// export const toggleActivationTodoGroup
