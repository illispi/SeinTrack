import {
	type Component,
	For,
	Show,
	createEffect,
	createSignal,
} from "solid-js";
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
	type BeforeLeaveEventArgs,
	useBeforeLeave,
	useSearchParams,
} from "@solidjs/router";
import type { inferRouterOutputs } from "@trpc/server";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/light.css";
import type { IAppRouter } from "~/server/trpc/routers/mainRouter";
import { trpc } from "~/utils/trpc";
import "../test.css";
import AddTime from "./AddTime";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Toaster, showToast } from "./ui/toast";

type RouterOutput = inferRouterOutputs<IAppRouter>;

const massageTagsAndGroupsToArr = (
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

const TodoPanel: Component<{ curProjectId: number }> = (props) => {
	const [selectedTag, setSelectedTag] = createSignal("none");
	const [selectedTagGroup, setSelectedTagGroup] = createSignal("bug fix");

	const [addHours, setAddHours] = createSignal(0);
	const [addMinutes, setAddMinutes] = createSignal(0);

	const [newTag, setNewTag] = createSignal("");
	const [newTagGroup, setNewTagGroup] = createSignal("");

	const [newTodo, setNewTodo] = createSignal("");

	const [searchParams, setSearchParams] = useSearchParams();

	const [todoOrTag, setTodoOrTag] = createSignal<"todo" | "tag" | null>(null);

	const [openFirst, setOpenFirst] = createSignal(false);

	const [openSecond, setOpenSecond] = createSignal(false);

	useBeforeLeave((event: BeforeLeaveEventArgs) => {
		if (
			openFirst() &&
			Number.isInteger(event.to) &&
			(event.to as number) < 0 &&
			!openSecond()
		) {
			setOpenFirst(false);
		}
		if (
			openSecond() &&
			Number.isInteger(event.to) &&
			(event.to as number) < 0 &&
			openFirst()
		) {
			setOpenSecond(false);
		}
	});

	createEffect(() => {
		if (openFirst()) {
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

	const [datepicker, setDatepicker] = createSignal<HTMLDivElement>();

	let datePickerInstance;

	createEffect(() => {
		if (datepicker()) {
			datePickerInstance = flatpickr(datepicker(), {
				// onChange: (selectedDates, dateStr, instance) => {
				// 	setTodoDateCompleted(dateStr);
				// },
				static: true,
				inline: true,
				onReady: (selectedDates, dateStr, instance) => {
					instance.setDate(new Date());
				},
				altInput: true,
				altFormat: "F j, Y",
				dateFormat: "Y-m-d",
			});
		}
	});

	const completeTodo = trpc.completeTodo.createMutation(() => ({
		onSuccess: () => {
			setAddHours(0);
			setAddMinutes(0);
			datePickerInstance.setDate(new Date());
		},
	}));

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
					open={openFirst()}
					onOpenChange={() => {
						setOpenFirst(!openFirst());
					}}
				>
					<SheetTrigger>Todos</SheetTrigger>
					<SheetContent class="w-full max-w-96 p-0">
						<div class=" flex min-h-screen grow flex-col items-center">
							<h2 class="m-8 text-4xl font-light">Todos</h2>
							<div class="mb-4 flex w-11/12 items-center justify-between gap-12">
								<Dialog
									open={openSecond() && todoOrTag() === "todo"}
									onOpenChange={() => {
										setTodoOrTag("todo");
										setOpenSecond(!openSecond());
									}}
								>
									<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
										<Button class="w-full" variant={"secondary"}>
											Add Todo
										</Button>
									</DialogTrigger>
									<DialogContent class="  sm:max-w-[425px]">
										<DialogHeader>
											<DialogTitle>Add todo</DialogTitle>
										</DialogHeader>
										<div class="flex items-center justify-start gap-4">
											<TextField
												value={newTodo()}
												onChange={setNewTodo}
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
											<Show when={tagsActive.data} fallback="No tags found">
												{(tags) => (
													<>
														<Select
															class="flex"
															//NOTE issue on shadnc solid-ui?
															defaultValue={"none"}
															value={selectedTag()}
															onChange={setSelectedTag}
															options={[
																"none",
																...massageTagsAndGroupsToArr(tags()),
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
													</>
												)}
											</Show>
											<Show
												when={tagGroupsActive.data}
												fallback="No tag groups found"
											>
												{(tagGroups) => (
													<>
														<Select
															class="flex"
															value={selectedTagGroup()}
															onChange={setSelectedTagGroup}
															options={[
																...massageTagsAndGroupsToArr(tagGroups()),
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
													</>
												)}
											</Show>
										</div>

										<DialogFooter>
											<Button
												onClick={() => {
													addTodo.mutate({
														projectId: props.curProjectId,
														tagGroup: selectedTagGroup(),
														todo: newTodo(),
														tagId:
															selectedTag() === "none"
																? null
																: tagsActive.data?.find(
																		(e) => e.tag === selectedTag(),
																	)?.id,
													});
												}}
												class="w-full p-0"
												variant={"secondary"}
												type="submit"
											>
												Add Todo
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>

								<Dialog
									open={openSecond() && todoOrTag() === "tag"}
									onOpenChange={() => {
										setTodoOrTag("tag");
										setOpenSecond(!openSecond());
									}}
								>
									<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
										<Button class="w-full" variant={"secondary"}>
											Add Tag
										</Button>
									</DialogTrigger>
									<DialogContent class=" ">
										<DialogHeader>
											<DialogTitle>Add Tag/Group</DialogTitle>
										</DialogHeader>
										<div class="flex items-center justify-start gap-4">
											<TextField
												value={newTag()}
												onChange={setNewTag}
												class="grid w-full items-center gap-1.5"
											>
												<TextFieldLabel for="tag">New Tag</TextFieldLabel>
												<div class="flex items-center justify-start gap-4">
													<TextFieldInput
														type="text"
														id="tag"
														placeholder="Tag"
													/>
													<Button
														onClick={() => {
															addTag.mutate({
																nameOfTagOrGroup: newTag(),
																projectId: props.curProjectId,
																switch: "tag",
															});
														}}
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
												value={newTagGroup()}
												onChange={setNewTagGroup}
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
														onClick={() =>
															addTagGroup.mutate({
																nameOfTagOrGroup: newTagGroup(),
																projectId: prop.curProjectId,
																switch: "tagGroup",
															})
														}
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
								<Toaster />
							</div>

							<For each={unDoneTodos.data}>
								{(e) => (
									<div class="my-4 flex h-32 w-11/12 items-start justify-between rounded-lg border border-t-2 border-gray-200 p-4 shadow-md">
										<div class="flex h-full flex-col items-start justify-between">
											<p class="text-wrap break-words text-sm lg:text-base">
												{e.todo}
											</p>
											<p class="text-sm italic">{`tag: ${e.tag ? e.tag : "none"} || group: ${e.tagGroup}`}</p>
										</div>
										<div class="flex flex-col items-center justify-center gap-4">
											<Dialog>
												<DialogTrigger>
													<Button variant="secondary" class="w-16">
														Done
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle class="text-center">
															Complete Todo:
														</DialogTitle>
													</DialogHeader>
													<div class="mx-auto flex w-full max-w-[310px] flex-col items-center justify-between gap-8">
														<p class="mt-4 w-full border-t border-t-green-500 pt-4">
															{e.todo}
														</p>
														<div class="w-full border-t border-t-green-500 pt-4 text-sm font-semibold">
															Hours spent:
														</div>
														<div>
															<AddTime
																hours={addHours()}
																minutes={addMinutes()}
																setHours={setAddHours}
																setMinutes={setAddMinutes}
															/>
														</div>
														<div class=" w-full border-t border-t-green-500 pt-4 text-sm font-semibold">
															Date completed:
														</div>
														<div class="flex h-80 w-full items-center justify-center">
															<input
																class="w-full"
																type="text"
																ref={setDatepicker}
															></input>
														</div>
														<Button
															onClick={() => {
																completeTodo.mutate({
																	date: datePickerInstance.selectedDates[0],
																	hoursWorked: Number(
																		Number(
																			addHours() + addMinutes() / 60,
																		).toFixed(2),
																	),
																	todoId: e.id,
																});
															}}
															class="w-full max-w-64"
															variant={"secondary"}
														>
															Complete
														</Button>
													</div>
												</DialogContent>
											</Dialog>

											<Button variant="outline" class="w-16">
												Edit
											</Button>
										</div>
									</div>
								)}
							</For>
						</div>
					</SheetContent>
				</Sheet>
			</div>
			<div class="m-4 hidden min-h-screen w-11/12 max-w-lg grow flex-col items-center rounded-xl border border-t-4 border-gray-200 border-t-green-500 shadow-md xl:flex">
				<h2 class="m-8 text-4xl font-light">Todos</h2>
				<div class="mb-4 flex w-11/12 items-center justify-between gap-12">
					<Dialog>
						<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
							<Button class="w-full" variant={"secondary"}>
								Add Todo
							</Button>
						</DialogTrigger>
						<DialogContent class="  sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Add todo</DialogTitle>
							</DialogHeader>
							<div class="flex items-center justify-start gap-4">
								<TextField
									value={newTodo()}
									onChange={setNewTodo}
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
								<Show when={tagsActive.data} fallback="No tags found">
									{(tags) => (
										<>
											<Select
												class="flex"
												//NOTE issue on shadnc solid-ui?
												defaultValue={"none"}
												value={selectedTag()}
												onChange={setSelectedTag}
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
									when={tagGroupsActive.data}
									fallback="No tag groups found"
								>
									{(tagGroups) => (
										<>
											<Select
												class="flex"
												value={selectedTagGroup()}
												onChange={setSelectedTagGroup}
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

							<DialogFooter>
								<Button
									onClick={() => {
										addTodo.mutate({
											projectId: props.curProjectId,
											tagGroup: selectedTagGroup(),
											todo: newTodo(),
											tagId:
												selectedTag() === "none"
													? null
													: tagsActive.data?.find(
															(e) => e.tag === selectedTag(),
														)?.id,
										});
									}}
									class="w-full p-0"
									variant={"secondary"}
									type="submit"
								>
									Add Todo
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog>
						<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
							<Button class="w-full" variant={"secondary"}>
								Add Tag
							</Button>
						</DialogTrigger>
						<DialogContent class=" ">
							<DialogHeader>
								<DialogTitle>Add Tag/Group</DialogTitle>
							</DialogHeader>
							<div class="flex items-center justify-start gap-4">
								<TextField
									value={newTag()}
									onChange={setNewTag}
									class="grid w-full items-center gap-1.5"
								>
									<TextFieldLabel for="tag">New Tag</TextFieldLabel>
									<div class="flex items-center justify-start gap-4">
										<TextFieldInput type="text" id="tag" placeholder="Tag" />
										<Button
											onClick={() => {
												addTag.mutate({
													nameOfTagOrGroup: newTag(),
													projectId: props.curProjectId,
													switch: "tag",
												});
											}}
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
									value={newTagGroup()}
									onChange={setNewTagGroup}
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
											onClick={() =>
												addTagGroup.mutate({
													nameOfTagOrGroup: newTagGroup(),
													projectId: prop.curProjectId,
													switch: "tagGroup",
												})
											}
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
					<Toaster />
				</div>

				<For each={unDoneTodos.data}>
					{(e) => (
						<div class="my-4 flex h-32 w-11/12 items-start justify-between rounded-lg border border-t-2 border-gray-200 p-4 shadow-md">
							<div class="flex h-full flex-col items-start justify-between">
								<p class="text-wrap break-words text-sm lg:text-base">
									{e.todo}
								</p>
								<p class="text-sm italic">{`tag: ${e.tag ? e.tag : "none"} || group: ${e.tagGroup}`}</p>
							</div>
							<div class="flex flex-col items-center justify-center gap-4">
								<Dialog>
									<DialogTrigger>
										<Button variant="secondary" class="w-16">
											Done
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle class="text-center">
												Complete Todo:
											</DialogTitle>
										</DialogHeader>
										<div class="mx-auto flex w-full max-w-[310px] flex-col items-center justify-between gap-8">
											<p class="mt-4 w-full border-t border-t-green-500 pt-4">
												{e.todo}
											</p>
											<div class="w-full border-t border-t-green-500 pt-4 text-sm font-semibold">
												Hours spent:
											</div>
											<div>
												<AddTime
													hours={addHours()}
													minutes={addMinutes()}
													setHours={setAddHours}
													setMinutes={setAddMinutes}
												/>
											</div>
											<div class=" w-full border-t border-t-green-500 pt-4 text-sm font-semibold">
												Date completed:
											</div>
											<div class="flex h-80 w-full items-center justify-center">
												<input
													class="w-full"
													type="text"
													ref={setDatepicker}
												></input>
											</div>
											<Button
												onClick={() => {
													completeTodo.mutate({
														date: datePickerInstance.selectedDates[0],
														hoursWorked: Number(
															Number(addHours() + addMinutes() / 60).toFixed(2),
														),
														todoId: e.id,
													});
												}}
												class="w-full max-w-64"
												variant={"secondary"}
											>
												Complete
											</Button>
										</div>
									</DialogContent>
								</Dialog>

								<Button variant="outline" class="w-16">
									Edit
								</Button>
							</div>
						</div>
					)}
				</For>
			</div>
		</>
	);
};

export default TodoPanel;
