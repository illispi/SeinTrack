import {
	type Component,
	type Setter,
	createEffect,
	createSignal,
} from "solid-js";

import { trpc } from "~/utils/trpc";

import BackNav from "./BackNav";
import UnDoneTodos from "./UnDoneTodos";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { showToast } from "./ui/toast";

const TodoPanel: Component<{
	curProjectId: number;
	openFirst: boolean;
	setOpenFirst: Setter<boolean>;
}> = (props) => {
	const [selectedTag, setSelectedTag] = createSignal("none");

	const [addHours, setAddHours] = createSignal(0);
	const [addMinutes, setAddMinutes] = createSignal(0);

	const [newTag, setNewTag] = createSignal("");
	const [newTagGroup, setNewTagGroup] = createSignal("");

	const [newTodo, setNewTodo] = createSignal("");

	const [todoOrTag, setTodoOrTag] = createSignal<"todo" | "tag" | null>(null);

	const [openSecond, setOpenSecond] = createSignal(false);

	const unDoneTodos = trpc.getUnDoneTodos.createQuery(() => ({
		projectId: props.curProjectId,
	}));

	const addTodo = trpc.addTodo.createMutation(() => ({
		onSuccess: () => {
			showToast({
				title: "Todo added:",
				description: `${newTodo()}`,
				variant: "success",
			});
			setNewTodo("");
			setSelectedTag("none");
			setSelectedTagGroup(tagGroupsActive.data[0].tagGroup);
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
	const [selectedTagGroup, setSelectedTagGroup] = createSignal(
		tagGroupsActive.data[0].tagGroup,
	);

	createEffect(() => {
		setSelectedTagGroup(tagGroupsActive.data[0]?.tagGroup);
	});

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
				<BackNav open={props.openFirst} setOpen={props.setOpenFirst}>
					<Sheet
						open={props.openFirst}
						//TODO might work like (bool) => setopenfirst(bool)
						onOpenChange={() => {
							props.setOpenFirst(!props.openFirst);
						}}
					>
						<SheetTrigger class="hidden">Todos</SheetTrigger>
						<SheetContent class="w-full max-w-96 p-0">
							<div class=" flex min-h-screen grow flex-col items-center border border-t-4 border-gray-200 border-t-green-500 bg-white shadow-md">
								<UnDoneTodos
									newTag={newTag()}
									newTagGroup={newTagGroup()}
									newTodo={newTodo()}
									openSecond={openSecond()}
									setSelectedTag={setSelectedTag}
									setSelectedTagGroup={setSelectedTagGroup}
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
									unDoneTodos={unDoneTodos.data!}
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
											tagGroupId: tagGroupsActive.data?.find(
												(e) => e.tagGroup === selectedTagGroup(),
											)?.id as number,
											todo: newTodo(),
											tagId:
												selectedTag() === "none"
													? null
													: tagsActive.data?.find(
															(e) => e.tag === selectedTag(),
														)?.id,
										});
									}}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</BackNav>
			</div>
			<div class="flex w-full justify-start">
				<div class="z-40 my-8 hidden min-h-screen w-11/12 max-w-md grow flex-col items-center rounded-xl border border-t-4 border-gray-200 border-t-green-500 bg-white shadow-md lg:flex">
					<UnDoneTodos
						newTag={newTag()}
						newTagGroup={newTagGroup()}
						newTodo={newTodo()}
						openSecond={openSecond()}
						selectedTag={selectedTag()}
						selectedTagGroup={selectedTagGroup()}
						setSelectedTag={setSelectedTag}
						setSelectedTagGroup={setSelectedTagGroup}
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
						unDoneTodos={unDoneTodos.data!}
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
								tagGroupId: tagGroupsActive.data?.find(
									(e) => e.tagGroup === selectedTagGroup(),
								)?.id as number,
								todo: newTodo(),
								tagId:
									selectedTag() === "none"
										? null
										: tagsActive.data?.find((e) => e.tag === selectedTag())?.id,
							});
						}}
					/>
				</div>
			</div>
		</>
	);
};

export default TodoPanel;
