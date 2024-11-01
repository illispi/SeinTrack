import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { adjustDateByOne } from "~/utils/functionsAndVariables";
import { publicProcedure } from "../initTrpc";

export const statsTodosFiltered = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				month: v.nullable(v.number()),
				year: v.nullable(v.number()),
				tagId: v.nullish(v.number()),
				tagGroupId: v.nullable(v.number()),
			}),
		),
	)
	.query(async ({ ctx, input }) => {
		let baseSelect = ctx.db
			.selectFrom("todos")
			.select(["dateCompleted", "hoursWorked", "tagGroupId", "tagId"])
			.innerJoin("tagGroups", "tagGroups.id", "todos.tagGroupId")
			.leftJoin("tags", "tags.id", "todos.tagId")
			.select([
				"todos.todo",
				"todos.id",
				"todos.tagId",
				"tagGroups.tagGroup",
				"tagGroups.id",
				"tags.tag",
				"todos.hoursWorked",
				"todos.dateCompleted",
			])
			.select("tagGroups.id as tagGroupId")
			.where("todos.completed", "=", true)
			.where("todos.projectId", "=", input.projectId)
			.where("todos.hoursWorked", "is not", null);

		if (input.year) {
			if (input.month) {
				const nextMonth = adjustDateByOne(input.year, input.month, true);
				baseSelect = baseSelect
					.where("dateCompleted", ">=", new Date(input.year, input.month, 1))
					.where(
						"dateCompleted",
						"<",
						new Date(nextMonth.year, nextMonth.month, 1),
					);
			} else {
				baseSelect = baseSelect
					.where("dateCompleted", ">=", new Date(input.year, 0, 1))
					.where("dateCompleted", "<", new Date(input.year + 1, 0, 1));
			}
		}

		if (input.tagId) {
			baseSelect = baseSelect.where("todos.tagId", "=", input.tagId);
		}
		if (input.tagId === null) {
			baseSelect = baseSelect.where("todos.tagId", "is", null);
		}
		if (input.tagGroupId) {
			baseSelect = baseSelect.where("todos.tagGroupId", "=", input.tagGroupId);
		}

		const final = await baseSelect.execute();
		let avgTodoTime: number;
		let totalTodoTime: number;

		if (final.length === 0) {
			avgTodoTime = 0;
			totalTodoTime = 0;
		} else {
			const temp = final.map((e) => e.hoursWorked);
			let acc = 0;
			for (const num of temp) {
				acc += num!;
			}
			avgTodoTime = acc / temp.length;
			totalTodoTime = acc;
		}

		let timeSelect = ctx.db.selectFrom("dates").select(["dates.hoursWorked"]);
		if (input.year) {
			if (input.month) {
				const nextMonth = adjustDateByOne(input.year, input.month, true);
				timeSelect = timeSelect
					.where("date", ">=", new Date(input.year, input.month, 1))
					.where("date", "<", new Date(nextMonth.year, nextMonth.month, 1));
			} else {
				timeSelect = timeSelect
					.where("date", ">=", new Date(input.year, 0, 1))
					.where("date", "<", new Date(input.year + 1, 0, 1));
			}
		}

		const time = await timeSelect.execute();

		let avgTime: number;
		let totalTime: number;

		if (time.length === 0) {
			avgTime = 0;
			totalTime = 0;
		} else {
			const temp = time.map((e) => e.hoursWorked);
			let acc = 0;
			for (const num of temp) {
				acc += num!;
			}
			avgTime = acc / temp.length;
			totalTime = acc;
		}

		return { avgTodoTime, totalTodoTime, avgTime, totalTime };
	});

//TODO use count and avg from db, not javascript
