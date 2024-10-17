
import { publicProcedure, router } from "../initTrpc";
import {
	changeDayHours,
	getFirstAndLastDate,
	getHoursOfDay,
} from "./datesRoutes";
import { allProjects, editProject } from "./projectRoutes";
import { AddTodo, addTagOrGroup, completeTodo, editTodo, toggleTagOrGroupActivation } from "./todoRoutes";

export const appRouter = router({
	test: publicProcedure.query(() => {
		// throw new TRPCError({ code: "NOT_FOUND" });
		return "hello";
	}),
	getHoursOfDay: getHoursOfDay,
	changeDayHours: changeDayHours,
	createProject: editProject,
	allProjects: allProjects,
	getFirstAndLastDate: getFirstAndLastDate,
	AddTodo: AddTodo,
	completeTodo: completeTodo,
	editTodo: editTodo,
	addTagOrGroup: addTagOrGroup,
	toggleTagOrGroupActivation: toggleTagOrGroupActivation
});

export type IAppRouter = typeof appRouter;

//BUG Does mutations need to return anything or do they leak memory like this without one?
