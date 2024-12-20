import { TRPCError } from "@trpc/server";
import * as v from "valibot";
import { adjustDateByOne } from "~/utils/functionsAndVariables";
import { publicProcedure } from "../initTrpc";
import { sql } from "kysely";

export const allProjectsStats = publicProcedure.query(async ({ ctx }) => {
	const projects = await ctx.db
		.selectFrom("projects")
		.select("projects.id")
		.where("projects.userId", "=", ctx.id)
		.execute();

	const totalArrHours: number[] = [];

	for (const project of projects) {
		const totalTime = await ctx.db
			.selectFrom("dates")
			.select(["dates.hoursWorked"])
			.where("projectId", "=", project.id)
			.execute();
		const filtered = totalTime
			.filter((e) => e.hoursWorked !== null)
			.map((e) => e.hoursWorked);
		totalArrHours.push(...filtered);
	}

	let total = totalArrHours.reduce(
		(accumulator, currentValue) => accumulator + currentValue,
		0,
	);

	total = total ?? 0;

	const avgTime = total / totalArrHours.length;

	const totalTodoArr: number[] = [];

	for (const project of projects) {
		const todoQuery = await ctx.db
			.selectFrom("todos")
			.select("hoursWorked")
			.where("completed", "=", true)
			.where("projectId", "=", project.id)
			.execute();

		const filtered = todoQuery
			.filter((e) => e.hoursWorked !== null)
			.map((e) => e.hoursWorked);
		totalTodoArr.push(...filtered);
	}

	let totalTodo = totalTodoArr.reduce(
		(accumulator, currentValue) => accumulator + currentValue,
		0,
	);

	totalTodo = totalTodo ?? 0;

	const avgTodo = totalTodo / totalTodoArr.length;

	return {
		totalTime: total,
		totalTodoTime: totalTodo,
		avgTime: avgTime,
		avgTodoTime: avgTodo,
	};
});

export const tagsDistribution = publicProcedure
	.input(
		v.parser(
			v.object({
				projectId: v.number(),
				month: v.nullable(v.number()),
				year: v.nullable(v.number()),
			}),
		),
	)
	.query(async ({ input, ctx }) => {
		let baseTagsSelect = ctx.db
			.selectFrom("todos")
			.leftJoin("tags", "todos.tagId", "tags.id")
			.select(({ eb }) => [
				"tags.tag",
				eb.fn
					.sum("todos.hoursWorked")
					.as("hoursTotal"),
				// sql<number>`sum(case when todos.tag_id is null then 1 else 1 end)`.as(
				// 	"tagCount",
				// ),
			])
			.where("todos.projectId", "=", input.projectId)
			.where("completed", "=", true)
			.groupBy("tags.tag");

		if (input.year) {
			if (input.month) {
				const nextMonth = adjustDateByOne(input.year, input.month, true);
				baseTagsSelect = baseTagsSelect
					.where("dateCompleted", ">=", new Date(input.year, input.month, 1))
					.where(
						"dateCompleted",
						"<",
						new Date(nextMonth.year, nextMonth.month, 1),
					);
			} else {
				baseTagsSelect = baseTagsSelect
					.where("dateCompleted", ">=", new Date(input.year, 0, 1))
					.where("dateCompleted", "<", new Date(input.year + 1, 0, 1));
			}
		}
		let baseTagGroupsSelect = ctx.db
			.selectFrom("todos")
			.innerJoin("tagGroups", "todos.tagGroupId", "tagGroups.id")
			.select(({ eb }) => [
				"tagGroups.tagGroup",
				eb.fn.sum("todos.hoursWorked").as("hoursTotal"),
			])
			.where("todos.projectId", "=", input.projectId)
			.where("completed", "=", true)
			.groupBy("tagGroups.tagGroup");

		if (input.year) {
			if (input.month) {
				const nextMonth = adjustDateByOne(input.year, input.month, true);
				baseTagGroupsSelect = baseTagGroupsSelect
					.where("dateCompleted", ">=", new Date(input.year, input.month, 1))
					.where(
						"dateCompleted",
						"<",
						new Date(nextMonth.year, nextMonth.month, 1),
					);
			} else {
				baseTagGroupsSelect = baseTagGroupsSelect
					.where("dateCompleted", ">=", new Date(input.year, 0, 1))
					.where("dateCompleted", "<", new Date(input.year + 1, 0, 1));
			}
		}

		const baseTags = await baseTagsSelect.execute();
		const baseTagGroups = await baseTagGroupsSelect.execute();
		// const sumTags = baseTags.reduce((accumulator, currentValue) => {
		// 	return accumulator + currentValue.tagCount;
		// }, 0);
		// const sumTagGroups = baseTagGroups.reduce((accumulator, currentValue) => {
		// 	return accumulator + currentValue.tagCount;
		// }, 0);

		// return {
		// 	tags: { ...baseTags, total: sumTags },
		// 	tagGroups: { ...baseTagGroups, total: sumTagGroups },
		// };

		return {
			tags: baseTags,
			tagGroups: baseTagGroups,
		};
	});

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
				"todos.tagId as tagId",
				"tagGroups.tagGroup",
				"tagGroups.id as tagGroupId",
				"tags.tag",
				"todos.hoursWorked",
				"todos.dateCompleted",
			])
			.where("todos.completed", "=", true)
			.where("todos.projectId", "=", input.projectId)
			.where("todos.hoursWorked", "is not", null);

		if (input.year) {
			if (input.month) {
				const nextMonth = adjustDateByOne(input.year, input.month, true);
				baseSelect = baseSelect
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
				baseSelect = baseSelect
					.where("todos.dateCompleted", ">=", new Date(input.year, 0, 1))
					.where("todos.dateCompleted", "<", new Date(input.year + 1, 0, 1));
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
			const temp = final
				.filter((e) => e.hoursWorked !== null)
				.map((e) => e.hoursWorked);
			let acc = 0;
			for (const num of temp) {
				acc += num;
			}
			avgTodoTime = acc / temp.length;
			totalTodoTime = acc;
		}

		let timeSelect = ctx.db
			.selectFrom("dates")
			.select(["dates.hoursWorked"])
			.where("projectId", "=", input.projectId);
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
			const temp = time.filter((e) => e.hoursWorked).map((e) => e.hoursWorked);
			let acc = 0;
			for (const num of temp) {
				acc += num;
			}
			avgTime = acc / temp.length;
			totalTime = acc;
		}

		return { avgTodoTime, totalTodoTime, avgTime, totalTime };
	});

//TODO use count and avg from db, not javascript
