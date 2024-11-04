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
	setDefault,
} from "./projectRoutes";
import { statsTodosFiltered, tagsDistribution } from "./statsRoutes";
import {
	addTodo,
	editTagOrGroupName,
	getAllTagGroups,
	addTagOrGroup,
	completeTodo,
	deleteTodo,
	editTodo,
	doneTodosInf,
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
	doneTodosInf: doneTodosInf,
	getTagsOrGroupsActiveOrNot: getTagsOrGroupsActiveOrNot,
	getHoursForDate: getHoursForDate,
	EditTagOrGroupName: editTagOrGroupName,
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
	setDefault: setDefault,
	statsTodosFiltered: statsTodosFiltered,
	tagsDistribution: tagsDistribution
});

export type IAppRouter = typeof appRouter;

//BUG Does mutations need to return anything or do they leak memory like this without one?
