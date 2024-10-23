import { router } from "../initTrpc";
import {
	changeDayHours,
	getFirstAndLastDate,
	getHoursForDate,
	getHoursOfDay,
} from "./datesRoutes";
import { allProjects, editProject } from "./projectRoutes";
import {
	AddTodo,
	EditTagOrGroupName,
	addTagOrGroup,
	completeTodo,
	editTodo,
	getDoneTodosByMonth,
	getTagsOrGroupsActiveOrNot,
	getUnDoneTodos,
	toggleTagOrGroupActivation,
} from "./todoRoutes";

export const appRouter = router({
	getHoursOfDay: getHoursOfDay,
	changeDayHours: changeDayHours,
	createProject: editProject,
	allProjects: allProjects,
	getFirstAndLastDate: getFirstAndLastDate,
	AddTodo: AddTodo,
	completeTodo: completeTodo,
	editTodo: editTodo,
	addTagOrGroup: addTagOrGroup,
	toggleTagOrGroupActivation: toggleTagOrGroupActivation,
	getUnDoneTodos: getUnDoneTodos,
	getDoneTodosByMonth: getDoneTodosByMonth,
	getTagsOrGroupsActiveOrNot: getTagsOrGroupsActiveOrNot,
	getHoursForDate: getHoursForDate,
	EditTagOrGroupName: EditTagOrGroupName,
});

export type IAppRouter = typeof appRouter;

//BUG Does mutations need to return anything or do they leak memory like this without one?
