import { router } from "../initTrpc";
import {
	changeDayHours,
	getFirstAndLastDate,
	getHoursForDate,
	getHoursOfDay,
	zeroTimer,
} from "./datesRoutes";
import {
	allProjects,
	editActiveDays,
	editProject,
	editTargetHours,
	getActiveDays,
	getTargetHours,
	newProject,
} from "./projectRoutes";
import {
	addTodo,
	EditTagOrGroupName,
	getAllTagGroups,
	addTagOrGroup,
	completeTodo,
	deleteTodo,
	editTodo,
	getDoneTodosByMonth,
	getTagsOrGroupsActiveOrNot,
	getUnDoneTodos,
	getAllTags,
	toggleTagActive,
	toggleTagGroupActive,
} from "./todoRoutes";

export const appRouter = router({
	getHoursOfDay: getHoursOfDay,
	changeDayHours: changeDayHours,
	editProject: editProject,
	allProjects: allProjects,
	getFirstAndLastDate: getFirstAndLastDate,
	addTodo: addTodo,
	completeTodo: completeTodo,
	editTodo: editTodo,
	addTagOrGroup: addTagOrGroup,
	getUnDoneTodos: getUnDoneTodos,
	getDoneTodosByMonth: getDoneTodosByMonth,
	getTagsOrGroupsActiveOrNot: getTagsOrGroupsActiveOrNot,
	getHoursForDate: getHoursForDate,
	EditTagOrGroupName: EditTagOrGroupName,
	deleteTodo: deleteTodo,
	zeroTimer: zeroTimer,
	newProject: newProject,
	getActiveDays: getActiveDays,
	editActiveDays: editActiveDays,
	getTargetHours: getTargetHours,
	editTargetHours: editTargetHours,
	getAllTagGroups: getAllTagGroups,
	getAllTags: getAllTags,
	toggleTagActive: toggleTagActive,
	toggleTagGroupActive: toggleTagGroupActive,
});

export type IAppRouter = typeof appRouter;

//BUG Does mutations need to return anything or do they leak memory like this without one?
