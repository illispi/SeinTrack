import {
	type Component,
	createEffect,
	createSignal,
	type Setter,
} from "solid-js";

import {
	type BeforeLeaveEventArgs,
	useBeforeLeave,
	useSearchParams,
} from "@solidjs/router";
import "flatpickr/dist/themes/light.css";
import { trpc } from "~/utils/trpc";

import UnDoneTodos from "./UnDoneTodos";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { showToast } from "./ui/toast";

const TodoPanel: Component<{
	curProjectId: number;
	openFirst: boolean;
	setOpenFirst: Setter<boolean>;
}> = (props) => {
	const [selectedTag, setSelectedTag] = createSignal("none");
	const [selectedTagGroup, setSelectedTagGroup] = createSignal("bug fix");

	const [addHours, setAddHours] = createSignal(0);
	const [addMinutes, setAddMinutes] = createSignal(0);

	const [newTag, setNewTag] = createSignal("");
	const [newTagGroup, setNewTagGroup] = createSignal("");

	const [newTodo, setNewTodo] = createSignal("");

	const [searchParams, setSearchParams] = useSearchParams();

	const [todoOrTag, setTodoOrTag] = createSignal<"todo" | "tag" | null>(null);

	const [openSecond, setOpenSecond] = createSignal(false);

	useBeforeLeave((event: BeforeLeaveEventArgs) => {
		//BUG on brave, try prevent default and event.retry at start and end of function
		//TODO test this more on mobile as well
		if (
			props.openFirst &&
			Number.isInteger(event.to) &&
			(event.to as number) < 0 &&
			!openSecond()
		) {
			console.log("close first");
			props.setOpenFirst(false);
		}
		if (
			openSecond() &&
			Number.isInteger(event.to) &&
			(event.to as number) < 0
			//NOTE commenting this fixed chrome but not brave
			//  &&
			// openFirst()
		) {
			setOpenSecond(false);
		}
	});

	createEffect(() => {
		if (props.openFirst) {
			setSearchParams({ backHistoryFirst: true });
		} else {
			setSearchParams({ backHistoryFirst: null });
		}
		if (openSecond()) {
			setSearchParams({ backHistorySecond: true });
		} else {
			setSearchParams({ backHistorySecond: null });
		}
	});

	const unDoneTodos = trpc.getUnDoneTodos.createQuery(() => ({
		projectId: props.curProjectId,
	}));

	const addTodo = trpc.AddTodo.createMutation(() => ({
		onSuccess: () => {
			showToast({
				title: "Todo added:",
				description: `${newTodo()}`,
				variant: "success",
			});
			setNewTodo("");
			setSelectedTag("none");
			setSelectedTagGroup("bug fix");
		},
	}));
	const tagsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: props.curProjectId,
		switch: "tag",
	}));
	const tagGroupsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: props.curProjectId,
		switch: "tagGroup",
	}));

	const addTag = trpc.addTagOrGroup.createMutation(() => ({
		onSuccess: () => {
			showToast({
				title: "Tag added:",
				description: `${newTag()}`,
				variant: "success",
			});
			setNewTag("");
		},
	}));
	const addTagGroup = trpc.addTagOrGroup.createMutation(() => ({
		onSuccess: () => {
			showToast({
				title: "Tag group added:",
				description: `${newTagGroup()}`,
				variant: "success",
			});
			setNewTagGroup("");
		},
	}));
	createEffect(() => {
		if (addTodo.isError) {
			showToast({
				title: "ERROR!",
				description: addTodo.error?.message,
				variant: "error",
			});
			addTodo.reset();
		}
		if (addTag.isError) {
			showToast({
				title: "ERROR!",
				description: addTag.error?.message,
				variant: "error",
			});
			addTag.reset();
		}
		if (addTagGroup.isError) {
			showToast({
				title: "ERROR!",
				description: addTagGroup.error?.message,
				variant: "error",
			});
			addTagGroup.reset();
		}
	});
	return (
		<>
			<div class="fixed bottom-0 right-0 flex lg:hidden">
				<Sheet
					open={props.openFirst}
					//TODO might work like (bool) => setopenfirst(bool)
					onOpenChange={() => {
						props.setOpenFirst(!props.openFirst);
					}}
				>
					<SheetTrigger class="hidden">Todos</SheetTrigger>
					<SheetContent class="w-full max-w-96 p-0">
						<div class=" flex min-h-screen grow flex-col items-center">
							<UnDoneTodos
								newTag={newTag()}
								newTagGroup={newTagGroup()}
								newTodo={newTodo()}
								openSecond={openSecond()}
								selectedTag={selectedTag()}
								selectedTagGroup={selectedTagGroup()}
								setAddHours={setAddHours}
								setAddMinutes={setAddMinutes}
								setNewTag={setNewTag}
								setNewTagGroup={setNewTagGroup}
								setNewTodo={setNewTodo}
								setOpenSecond={setOpenSecond}
								setTodoOrTag={setTodoOrTag}
								tagsActive={tagsActive.data}
								tagGroupsActive={tagGroupsActive.data}
								todoOrTag={todoOrTag()}
								unDoneTodos={unDoneTodos.data}
								addHours={addHours()}
								addMinutes={addMinutes()}
								addTagGroupOnClick={() =>
									addTagGroup.mutate({
										nameOfTagOrGroup: newTagGroup(),
										projectId: props.curProjectId,
										switch: "tagGroup",
									})
								}
								addTagOnClick={() => {
									addTag.mutate({
										nameOfTagOrGroup: newTag(),
										projectId: props.curProjectId,
										switch: "tag",
									});
								}}
								addTodoOnClick={() => {
									addTodo.mutate({
										projectId: props.curProjectId,
										tagGroup: selectedTagGroup(),
										todo: newTodo(),
										tagId:
											selectedTag() === "none"
												? null
												: tagsActive.data?.find((e) => e.tag === selectedTag())
														?.id,
									});
								}}
							/>
						</div>
					</SheetContent>
				</Sheet>
			</div>
			<div class="m-4 hidden min-h-screen w-11/12 max-w-lg grow flex-col items-center rounded-xl border border-t-4 border-gray-200 border-t-green-500 shadow-md xl:flex">
				<UnDoneTodos
					newTag={newTag()}
					newTagGroup={newTagGroup()}
					newTodo={newTodo()}
					openSecond={openSecond()}
					selectedTag={selectedTag()}
					selectedTagGroup={selectedTagGroup()}
					setAddHours={setAddHours}
					setAddMinutes={setAddMinutes}
					setNewTag={setNewTag}
					setNewTagGroup={setNewTagGroup}
					setNewTodo={setNewTodo}
					setOpenSecond={setOpenSecond}
					setTodoOrTag={setTodoOrTag}
					tagsActive={tagsActive.data}
					tagGroupsActive={tagGroupsActive.data}
					todoOrTag={todoOrTag()}
					unDoneTodos={unDoneTodos.data}
					addHours={addHours()}
					addMinutes={addMinutes()}
					addTagGroupOnClick={() =>
						addTagGroup.mutate({
							nameOfTagOrGroup: newTagGroup(),
							projectId: props.curProjectId,
							switch: "tagGroup",
						})
					}
					addTagOnClick={() => {
						addTag.mutate({
							nameOfTagOrGroup: newTag(),
							projectId: props.curProjectId,
							switch: "tag",
						});
					}}
					addTodoOnClick={() => {
						addTodo.mutate({
							projectId: props.curProjectId,
							tagGroup: selectedTagGroup(),
							todo: newTodo(),
							tagId:
								selectedTag() === "none"
									? null
									: tagsActive.data?.find((e) => e.tag === selectedTag())?.id,
						});
					}}
				/>
			</div>
		</>
	);
};

export default TodoPanel;
