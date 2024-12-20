import { Link } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import type { inferRouterOutputs } from "@trpc/server";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import type { Instance } from "flatpickr/dist/types/instance";
import {
	type Component,
	For,
	type Setter,
	Show,
	createEffect,
	createSignal,
} from "solid-js";
import type { IAppRouter } from "~/server/trpc/routers/mainRouter";
import { trpc } from "~/utils/trpc";
import "../test.css";
import AddTime from "./AddTime";
import BackNav from "./BackNav";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Toaster, showToast } from "./ui/toast";

type RouterOutput = inferRouterOutputs<IAppRouter>;

export const massageTagsAndGroupsToArr = (
	data: RouterOutput["getTagsOrGroupsActiveOrNot"],
): string[] => {
	const arr = [];

	if (data) {
		for (const el of data) {
			if ("tag" in el) {
				if (el.tag) {
					arr.push(el.tag);
				}
			} else {
				arr.push(el.tagGroup);
			}
		}
	}

	return arr;
};

const tags = (filterTag: number, data: any): string => {
	if (filterTag === undefined) {
		return "all";
	}
	if (filterTag === null) {
		return "none";
	}

	return data?.find((el) => el.id === filterTag).tag;
};

const tagGroups = (filterTagGroup: number, data: any) => {
	if (filterTagGroup === null) {
		return "all";
	}

	return data?.find((el) => el.id === filterTagGroup).tagGroup;
};
const UnDoneTodos: Component<{
	openSecond: boolean;
	setOpenSecond: Setter<boolean>;
	setSelectedTag: Setter<string>;
	todoOrTag: "todo" | "tag" | null;
	setTodoOrTag: Setter<"todo" | "tag" | null>;
	newTodo: string;
	setNewTodo: Setter<string>;
	tagsActive: RouterOutput["getTagsOrGroupsActiveOrNot"];
	tagGroupsActive: RouterOutput["getTagsOrGroupsActiveOrNot"];
	selectedTag: string;
	selectedTagGroup: string;
	addTodoOnClick: () => void;
	addTagOnClick: () => void;
	addTagGroupOnClick: () => void;
	newTag: string;
	setNewTag: Setter<string>;
	newTagGroup: string;
	setNewTagGroup: Setter<string>;
	addHours: number;
	addMinutes: number;
	setAddHours: Setter<number>;
	setAddMinutes: Setter<number>;
	projectId: number;
	setSelectedTagGroup: Setter<string>;
}> = (props) => {
	const [filterDialog, setFilterDialog] = createSignal(false);
	const [filterTag, setFilterTag] = createSignal<number | null | undefined>(
		undefined,
	);
	const [filterTagGroup, setFilterTagGroup] = createSignal<number | null>(null);

	let datePickerInstance: Instance;
	const [datePickerRef, setDatePickerRef] = createSignal("");
	createEffect(() => {
		if (datePickerRef() !== "") {
			datePickerInstance = flatpickr(datePickerRef(), {
				static: true,
				inline: true,
				onReady: (selectedDates, dateStr, instance) => {
					instance.setDate(new Date());
				},
				altInput: true,
				altFormat: "F j, Y",
				dateFormat: "Y-m-d",
			}) as Instance;
		}
	});
	const [editOpen, setEditOpen] = createSignal(false);
	const [doneOpen, setDoneOpen] = createSignal(false);

	const unDoneTodos = trpc.getUnDoneTodos.createQuery(() => ({
		filterTag: filterTag(),
		projectId: props.projectId,
		filterTagGroup: filterTagGroup(),
	}));

	const [curUndoneTodo, setCurUndoneTodo] = createSignal<{
		tagGroup: string;
		id: number;
		todo: string;
		tagId: number | null;
		tag: string | null;
	} | null>(null);

	const completeTodo = trpc.completeTodo.createMutation(() => ({
		onSuccess: () => {
			setDoneOpen(false);
			props.setAddHours(0);
			props.setAddMinutes(0);
			datePickerInstance.setDate(new Date());
			showToast({
				title: "Todo completed!",
				description: `${curUndoneTodo()?.todo}`,
				variant: "success",
			});
		},
	}));

	createEffect(() => {
		if (completeTodo.isError) {
			showToast({
				title: "Error!",
				description: `${completeTodo.error.message}`,
				variant: "error",
			});
			completeTodo.reset();
		}
	});

	const editTodo = trpc.editTodo.createMutation(() => ({
		onSuccess: () => {
			showToast({
				title: "Todo edited",
				description: `${editTodoText()}`,
				variant: "success",
			});
			setEditOpen(false);
		},
	}));

	const deleteTodo = trpc.deleteTodo.createMutation(() => ({
		onSuccess: () => {
			setEditOpen(false);
		},
	}));

	const [editTodoText, setEditTodoText] = createSignal("");

	return (
		<>
			<Link rel="icon" href="../test.css" />
			<h2 class="m-8 text-4xl font-light">Todos</h2>
			<div class="mb-4 flex w-11/12 items-center justify-between gap-12 bg-white">
				<BackNav setOpen={props.setOpenSecond} open={props.openSecond}>
					<Dialog
						open={props.openSecond && props.todoOrTag === "todo"}
						onOpenChange={() => {
							props.setTodoOrTag("todo");
							props.setOpenSecond(!props.openSecond);
						}}
					>
						<DialogTrigger
							class="flex-1 p-0"
							as={Button<"button">}
							variant={"secondary"}
						>
							Add Todo
						</DialogTrigger>
						<DialogContent onOpenAutoFocus={(e) => e.preventDefault()} class="">
							<DialogHeader>
								<DialogTitle>Add todo</DialogTitle>
							</DialogHeader>
							<div class="flex items-center justify-start gap-4">
								<TextField
									value={props.newTodo}
									onChange={props.setNewTodo}
									class="grid w-full items-center gap-1.5"
								>
									<div class="flex items-center justify-start gap-4">
										<TextFieldInput
											type="text"
											id="newTodo"
											placeholder="New todo"
										/>
									</div>
								</TextField>
							</div>
							<div class="grid grid-cols-2">
								<h3 class="font-semibold">Tag:</h3>
								<h3 class="font-semibold">Tag group:</h3>

								<Select
									class="flex"
									defaultValue={"none"}
									value={props.selectedTag}
									onChange={props.setSelectedTag}
									options={[
										"none",
										...massageTagsAndGroupsToArr(props.tagsActive),
									]}
									placeholder="Select a tag"
									itemComponent={(props) => (
										<SelectItem item={props.item}>
											{props.item.rawValue}
										</SelectItem>
									)}
								>
									<SelectTrigger aria-label="Tag">
										<SelectValue<string>>
											{(state) => state.selectedOption()}
										</SelectValue>
									</SelectTrigger>
									<SelectContent />
								</Select>

								<Select
									class="flex"
									value={props.selectedTagGroup}
									onChange={props.setSelectedTagGroup}
									options={[
										...massageTagsAndGroupsToArr(props.tagGroupsActive),
									]}
									placeholder="Select a tag group"
									itemComponent={(props) => (
										<SelectItem item={props.item}>
											{props.item.rawValue}
										</SelectItem>
									)}
								>
									<SelectTrigger aria-label="TagGroup">
										<SelectValue<string>>
											{(state) => state.selectedOption()}
										</SelectValue>
									</SelectTrigger>
									<SelectContent />
								</Select>
							</div>

							<DialogFooter>
								<Button
									onClick={props.addTodoOnClick}
									class="w-full p-0"
									variant={"secondary"}
									type="submit"
								>
									Add Todo
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</BackNav>
				<BackNav setOpen={props.setOpenSecond} open={props.openSecond}>
					<Dialog
						open={props.openSecond && props.todoOrTag === "tag"}
						onOpenChange={() => {
							props.setTodoOrTag("tag");
							props.setOpenSecond(!props.openSecond);
						}}
					>
						<DialogTrigger
							class="flex-1 p-0"
							as={Button<"button">}
							variant={"secondary"}
						>
							Add Tag
						</DialogTrigger>
						<DialogContent
							onOpenAutoFocus={(e) => e.preventDefault()}
							class=" "
						>
							<DialogHeader>
								<DialogTitle>Add Tag/Group</DialogTitle>
							</DialogHeader>
							<div class="flex items-center justify-start gap-4">
								<TextField
									value={props.newTag}
									onChange={props.setNewTag}
									class="grid w-full items-center gap-1.5"
								>
									<TextFieldLabel for="tag">New Tag</TextFieldLabel>
									<div class="flex items-center justify-start gap-4">
										<TextFieldInput type="text" id="tag" placeholder="Tag" />
										<Button
											onClick={props.addTagOnClick}
											class="flex-1"
											variant={"secondary"}
										>
											Add
										</Button>
									</div>
								</TextField>
							</div>
							<div class="flex items-center justify-start gap-4">
								<TextField
									value={props.newTagGroup}
									onChange={props.setNewTagGroup}
									class="grid w-full items-center gap-1.5"
								>
									<TextFieldLabel for="tag">New Tag Group</TextFieldLabel>
									<div class="flex items-center justify-start gap-4">
										<TextFieldInput
											type="text"
											id="tagGroup"
											placeholder="Tag Group"
										/>
										<Button
											onClick={props.addTagGroupOnClick}
											class="flex-1"
											variant={"secondary"}
										>
											Add
										</Button>
									</div>
								</TextField>
							</div>
						</DialogContent>
					</Dialog>
				</BackNav>
			</div>
			<div>
				<BackNav open={filterDialog()} setOpen={setFilterDialog}>
					<Dialog open={filterDialog()} onOpenChange={setFilterDialog}>
						<DialogTrigger
							class="px-12 py-4"
							as={Button<"button">}
							variant={"outline"}
						>
							{`Filters (${(filterTag() !== undefined ? 1 : 0) + (filterTagGroup() ? 1 : 0)} on)`}
						</DialogTrigger>
						<DialogContent
							onOpenAutoFocus={(e) => e.preventDefault()}
							class=" "
						>
							<DialogHeader>
								<div class="grid grid-cols-2 gap-4">
									<h3 class="font-semibold">Tag:</h3>
									<h3 class="font-semibold">Tag group:</h3>

									<Select
										class="flex"
										defaultValue={"all"}
										value={tags(filterTag(), props.tagsActive)}
										onChange={(e) => {
											if (e === "none") {
												setFilterTag(null);
											} else {
												setFilterTag(
													props.tagsActive.find((el) => e === el.tag)?.id,
												);
											}
										}}
										options={[
											"all",
											"none",
											...massageTagsAndGroupsToArr(props.tagsActive),
										]}
										placeholder="Select a tag"
										itemComponent={(props) => (
											<SelectItem item={props.item}>
												{props.item.rawValue}
											</SelectItem>
										)}
									>
										<SelectTrigger aria-label="Tag">
											<SelectValue<string>>
												{(state) => state.selectedOption()}
											</SelectValue>
										</SelectTrigger>
										<SelectContent />
									</Select>

									<Select
										class="flex"
										defaultValue={"all"}
										value={tagGroups(filterTagGroup(), props.tagGroupsActive)}
										onChange={(e) => {
											if (e === "all") {
												setFilterTagGroup(null);
											} else {
												setFilterTagGroup(
													props.tagGroupsActive.find((el) => e === el.tagGroup)
														?.id,
												);
											}
										}}
										options={[
											"all",
											"none",
											...massageTagsAndGroupsToArr(props.tagGroupsActive),
										]}
										placeholder="Select a tag group"
										itemComponent={(props) => (
											<SelectItem item={props.item}>
												{props.item.rawValue}
											</SelectItem>
										)}
									>
										<SelectTrigger aria-label="TagGroup">
											<SelectValue<string>>
												{(state) => state.selectedOption()}
											</SelectValue>
										</SelectTrigger>
										<SelectContent />
									</Select>
									<Button
										class="col-span-2"
										variant={"secondary"}
										onClick={() => {
											setFilterTag(undefined);
											setFilterTagGroup(null);
										}}
									>
										Clear filters
									</Button>
								</div>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				</BackNav>
				<Toaster />
			</div>

			<For each={unDoneTodos.data}>
				{(unDoneTodo) => (
					<div class="my-4 flex min-h-28 w-11/12 items-start justify-between rounded-lg border border-t-2 border-gray-200 bg-white p-4 shadow-md">
						<div class="flex min-h-24  flex-col items-start justify-between">
							<p class="mr-2 text-wrap break-words text-sm lg:text-base">
								{unDoneTodo.todo}
							</p>
							<button
								type="button"
								onClick={() => {
									if (unDoneTodo.tag === null) {
										setFilterTag(null);
									} else {
										setFilterTag(
											props.tagsActive.find((el) => unDoneTodo.tag === el.tag)
												?.id,
										);
									}
								}}
								class="mt-4 text-sm italic"
							>{`tag: ${unDoneTodo.tag ? unDoneTodo.tag : "none"}`}</button>
							<button
								type="button"
								onClick={() => {
									setFilterTagGroup(
										props.tagGroupsActive.find(
											(el) => unDoneTodo.tagGroup === el.tagGroup,
										)?.id,
									);
								}}
								class="mt-4 text-sm italic"
							>{`tag group: ${unDoneTodo.tagGroup}`}</button>
						</div>
						<div class="flex flex-col items-center justify-center gap-4">
							<Button
								onClick={() => {
									setCurUndoneTodo(unDoneTodo);
									setDoneOpen(true);
								}}
								variant="secondary"
								class="w-16"
							>
								Done
							</Button>
							<Button
								onclick={() => {
									setCurUndoneTodo(unDoneTodo);
									setEditOpen(true);
									props.setSelectedTag(unDoneTodo.tag || "none");
									props.setSelectedTagGroup(unDoneTodo.tagGroup);
									setEditTodoText(unDoneTodo.todo);
								}}
								variant="outline"
								class="w-16"
							>
								Edit
							</Button>
						</div>
					</div>
				)}
			</For>
			<BackNav open={doneOpen()} setOpen={setDoneOpen}>
				<Dialog open={doneOpen()} onOpenChange={setDoneOpen}>
					<DialogTrigger></DialogTrigger>
					<DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
						<DialogHeader>
							<DialogTitle class="text-center">Complete Todo</DialogTitle>
						</DialogHeader>
						<div class="mx-auto flex w-full max-w-[310px] flex-col items-center justify-between gap-6">
							<p class="mt-4 w-full  ">{curUndoneTodo().todo}</p>
							<div class="mx-auto text-lg font-semibold">Hours spent:</div>
							<div>
								<AddTime
									hours={props.addHours}
									minutes={props.addMinutes}
									setHours={props.setAddHours}
									setMinutes={props.setAddMinutes}
								/>
							</div>
							<div class=" mx-auto text-lg font-semibold">Date completed:</div>
							<div class="flex h-80 w-full items-center justify-center">
								<input
									class="w-full"
									type="text"
									ref={setDatePickerRef}
								></input>
							</div>
							<Button
								onClick={() =>
									completeTodo.mutate({
										date: datePickerInstance.selectedDates[0],
										hoursWorked: Number(
											Number(props.addHours + props.addMinutes / 60).toFixed(2),
										),
										todoId: curUndoneTodo().id,
									})
								}
								class="w-full"
								variant={"secondary"}
							>
								Complete
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</BackNav>
			<BackNav open={editOpen()} setOpen={setEditOpen}>
				<Dialog open={editOpen()} onOpenChange={setEditOpen}>
					<DialogTrigger></DialogTrigger>
					<DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
						<DialogHeader>
							<DialogTitle class="text-center">Edit Todo</DialogTitle>
						</DialogHeader>
						<button
							type="button"
							onClick={() => {
								deleteTodo.mutate({ todoId: curUndoneTodo()?.id });
							}}
							class="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground"
						>
							<svg
								fill="currentColor"
								stroke-width="0"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 1024 1024"
								height="1em"
								width="1em"
								style="overflow: visible; color: currentcolor;"
								class="size-6"
							>
								<path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-200 0H360v-72h304v72z"></path>
							</svg>
						</button>
						<div class="mx-auto flex w-full max-w-[310px] flex-col items-center justify-between gap-12">
							<TextField
								value={editTodoText()}
								onChange={setEditTodoText}
								class="grid w-full items-center gap-1.5"
							>
								<div class="flex items-center justify-start gap-4">
									<TextFieldInput
										type="text"
										id="editTodo"
										placeholder="editTodo"
									/>
								</div>
							</TextField>
							<div class="grid w-full grid-cols-2">
								<h3 class="font-semibold">Tag</h3>
								<h3 class="font-semibold">Tag group</h3>
								<Show when={props.tagsActive} fallback="No tags found">
									{(tags) => (
										<>
											<Select
												class="flex"
												defaultValue={curUndoneTodo().tag || "none"}
												value={props.selectedTag}
												onChange={props.setSelectedTag}
												options={["none", ...massageTagsAndGroupsToArr(tags())]}
												placeholder="Select a tag"
												itemComponent={(props) => (
													<SelectItem item={props.item}>
														{props.item.rawValue}
													</SelectItem>
												)}
											>
												<SelectTrigger aria-label="Tag">
													<SelectValue<string>>
														{(state) => state.selectedOption()}
													</SelectValue>
												</SelectTrigger>
												<SelectContent />
											</Select>
										</>
									)}
								</Show>
								<Show
									when={props.tagGroupsActive}
									fallback="No tag groups found"
								>
									{(tagGroups) => (
										<>
											<Select
												class="flex"
												defaultValue={curUndoneTodo().tagGroup}
												value={props.selectedTagGroup}
												onChange={props.setSelectedTagGroup}
												options={[...massageTagsAndGroupsToArr(tagGroups())]}
												placeholder="Select a tag"
												itemComponent={(props) => (
													<SelectItem item={props.item}>
														{props.item.rawValue}
													</SelectItem>
												)}
											>
												<SelectTrigger aria-label="Tag">
													<SelectValue<string>>
														{(state) => state.selectedOption()}
													</SelectValue>
												</SelectTrigger>
												<SelectContent />
											</Select>
										</>
									)}
								</Show>
							</div>
							<Button
								onClick={() =>
									editTodo.mutate({
										dateCompleted: null,
										hoursWorked: null,
										todoId: curUndoneTodo().id,
										completed: false,
										tagId:
											props.selectedTag === "none"
												? null
												: props.tagsActive.find(
														(e) => e.tag === props.selectedTag,
													)?.id,
										todo: editTodoText(),
										tagGroupId: props.tagGroupsActive.find(
											(e) => e.tagGroup === props.selectedTagGroup,
										)?.id as number,
									})
								}
								class="w-full"
								variant={"secondary"}
							>
								Edit
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</BackNav>
		</>
	);
};

export default UnDoneTodos;
