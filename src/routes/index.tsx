import { A } from "@solidjs/router";
import { For, Show, Suspense, createEffect, createSignal } from "solid-js";
import BackNav from "~/components/BackNav";
import DayEditor from "~/components/DayEditor";
import ListMonth from "~/components/ListMonth";
import MenuPanel from "~/components/MenuPanel";
import NewProject from "~/components/NewProject";
import TodoPanel from "~/components/TodoPanel";
import { massageTagsAndGroupsToArr } from "~/components/UnDoneTodos";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { TextField, TextFieldInput } from "~/components/ui/text-field";
import { showToast } from "~/components/ui/toast";
import {
	adjustDateByOne,
	hoursToFormat,
	monthsArr,
} from "~/utils/functionsAndVariables";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const [curMonth, setCurMonth] = createSignal(new Date().getMonth());
	const [curYear, setCurYear] = createSignal(new Date().getFullYear());
	const [curDate, setCurDate] = createSignal<Date>(new Date());
	const [openFirst, setOpenFirst] = createSignal(false);
	const [start, setStart] = createSignal(true);

	const [filterDialog, setFilterDialog] = createSignal(false);
	const [filterMonth, setFilterMonth] = createSignal<number | null>(null);
	const [filterYear, setFilterYear] = createSignal<number | null>(null);
	const [filterTag, setFilterTag] = createSignal<number | null | undefined>(
		undefined,
	);
	const [filterTagGroup, setFilterTagGroup] = createSignal<number | null>(null);
	const [tagSelect, setTagSelect] = createSignal("All");
	const [tagGroupSelect, setTagGroupSelect] = createSignal("All");

	const [todo, setTodo] = createSignal<{
		id: number;
		dateCompleted: Date | null;
		hoursWorked: number | null;
		tagId: number | null;
		todo: string;
		tagGroup: string;
		tag: string | null;
		tagGroupId: number;
	} | null>(null);
	const [dayEditorOpen, setDayEditorOpen] = createSignal(false);
	const [curProjectId, setProjectId] = createSignal(1);

	const projects = trpc.allProjects.createQuery();
	const hours = trpc.getHoursForDate.createQuery(() => ({
		date: curDate(),
		projectId: curProjectId(),
	}));

	createEffect(() => {
		if (projects.data) {
			const active = projects.data?.filter((e) => e.active).map((e) => e.id);
			if (!active?.includes(curProjectId())) {
				setProjectId(projects.data.find((e) => e.default)?.id);
			} else {
				if (start()) {
					setProjectId(projects.data.find((e) => e.default === true)?.id);
					setStart(false);
				}
			}
		}
	});

	const [todoEditOpen, setTodoEditOpen] = createSignal(false);
	const [menuOpen, setMenuOpen] = createSignal(false);

	const [selectedTag, setSelectedTag] = createSignal("none");
	const [selectedTagGroup, setSelectedTagGroup] = createSignal("bug fix");

	//TODO test that removing below error works

	const [todoText, setTodoText] = createSignal("");

	const tagsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: curProjectId(),
		switch: "tag",
	}));
	const tagGroupsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: curProjectId(),
		switch: "tagGroup",
	}));

	const editTodo = trpc.editTodo.createMutation(() => ({
		onSuccess: () => {
			showToast({
				title: "Todo edited",
				description: `${todoText()}`,
				variant: "success",
			});
			setTodoEditOpen(false);
		},
	}));

	const deleteTodo = trpc.deleteTodo.createMutation(() => ({
		onSuccess: () => {
			setTodoEditOpen(false);
		},
	}));

	const doneTodos = trpc.doneTodosInf.createInfiniteQuery(
		() => ({
			limit: 10,
			projectId: curProjectId(),
			tagId: filterTag(),
			month: filterMonth(),
			year: filterYear(),
			tagGroupId: filterTagGroup(),
		}),
		() => ({
			getNextPageParam: (lastPage) => {
				return lastPage?.nextCursor;
			},
			initialPageParam: 0,
		}),
	);

	const tags = trpc.getAllTags.createQuery(() => ({
		projectId: curProjectId(),
	}));
	const tagGroups = trpc.getAllTagGroups.createQuery(() => ({
		projectId: curProjectId(),
	}));

	return (
		<>
			{/* <A class="fixed bottom-0 left-12" href="/testing/test/">
				Testing
			</A> */}
			<div class="sticky top-0 mx-auto flex h-12 w-full items-center justify-between bg-gradient-to-t from-green-500 to-green-400 shadow-md">
				<div class="flex-1">
					<div class="flex h-12 max-w-20 items-center justify-end rounded-e-full pr-5">
						<A href="/">
							<img
								class="size-12"
								src="icon.webp"
								alt="Logo"
								width="128"
								height="128"
							/>
						</A>
					</div>
				</div>
				<div class="flex h-12 items-center justify-center gap-6 rounded-s-full bg-white px-6 xl:hidden">
					<Button
						onClick={() => {
							setMenuOpen(!menuOpen());
						}}
						class="size-10 rounded-full bg-green-400 shadow-lg hover:bg-green-500 active:bg-green-500"
					>
						<svg
							fill="none"
							stroke-width="2"
							xmlns="http://www.w3.org/2000/svg"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							viewBox="0 0 24 24"
							height="2em"
							width="2em"
							style="overflow: visible; color: currentcolor;"
						>
							<path d="M3 12 21 12"></path>
							<path d="M3 6 21 6"></path>
							<path d="M3 18 21 18"></path>
						</svg>
					</Button>
					<Button
						class="size-10 rounded-full bg-green-400 shadow-lg hover:bg-green-500 active:bg-green-500 lg:hidden"
						onClick={() => {
							setOpenFirst(!openFirst());
						}}
					>
						<svg
							fill="currentColor"
							stroke-width="6"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 1024 1024"
							height="2em"
							width="2em"
							style="overflow: visible; color: currentcolor;"
						>
							<defs>
								<style></style>
							</defs>
							<path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8Z"></path>
							<path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8Z"></path>
						</svg>
					</Button>
				</div>
			</div>
			<main class="mx-auto w-full items-start justify-center lg:flex ">
				<Suspense>
					<Show when={projects.data} fallback={<NewProject />}>
						{(data) => (
							<>
								<MenuPanel
									menuOpen={menuOpen()}
									setMenuOpen={setMenuOpen}
									selectedProjectId={curProjectId()}
									setSelectedProjectId={setProjectId}
								/>
								<div
									class="m-8 mx-auto flex w-full max-w-5xl flex-col items-center 
										   justify-start gap-6 text-center text-gray-700"
								>
									<h2 class="text-lg font-semibold">{`${monthsArr[curMonth()]} ${curYear()}`}</h2>
									<Suspense>
										<ListMonth
											setDayEditorOpen={setDayEditorOpen}
											month={curMonth()}
											year={curYear()}
											projectId={curProjectId()}
											setCurDate={setCurDate}
											curDate={curDate()}
										/>
									</Suspense>
									<div class="flex w-11/12 max-w-96 flex-col gap-12">
										<div class="flex w-full items-center justify-between gap-8">
											<Button
												class="flex-1"
												variant={"outline"}
												onClick={() => {
													const back = adjustDateByOne(
														curYear(),
														curMonth(),
														false,
													);
													setCurMonth(back.month);
													setCurYear(back.year);
												}}
											>
												Back
											</Button>
											<Button
												class="flex-1"
												variant={"outline"}
											>{`${curMonth() + 1}/${curYear()}`}</Button>
											<Button
												class="flex-1"
												variant={"outline"}
												onClick={() => {
													const forward = adjustDateByOne(
														curYear(),
														curMonth(),
														true,
													);
													setCurMonth(forward.month);
													setCurYear(forward.year);
												}}
											>
												Next
											</Button>
										</div>
										<div class="flex w-full items-center justify-center gap-8">
											<Button
												onClick={() => {
													setFilterDialog(true);
												}}
												class="w-48"
												variant={"secondary"}
											>
												Filters
											</Button>
											<BackNav open={filterDialog()} setOpen={setFilterDialog}>
												<Dialog
													open={filterDialog()}
													onOpenChange={() => setFilterDialog(!filterDialog())}
												>
													<DialogTrigger></DialogTrigger>
													<DialogContent
														onOpenAutoFocus={(e) => e.preventDefault()}
													>
														<div>
															<div class="flex items-center justify-between">
																<div>
																	<h5 class="text-lg font-semibold">
																		Tag filter
																	</h5>
																	<Select
																		value={tagSelect()}
																		onChange={(e) => {
																			if (!e) {
																				setFilterTag(undefined);
																				setTagSelect("All");
																				return;
																			}
																			if (e === "None") {
																				setFilterTag(null);
																				setTagSelect(e);
																				return;
																			}
																			setFilterTag(
																				tags.data?.find((el) => el.tag === e)
																					?.id,
																			);
																			setTagSelect(e);
																			return;
																		}}
																		options={[
																			"All",
																			"None",
																			...tags.data?.map((e) => e.tag),
																		]}
																		placeholder="Tag"
																		itemComponent={(props) => (
																			<SelectItem item={props.item}>
																				{props.item.rawValue}
																			</SelectItem>
																		)}
																	>
																		<SelectTrigger
																			aria-label="Tag"
																			class="w-[180px]"
																		>
																			<SelectValue<string>>
																				{(state) => state.selectedOption()}
																			</SelectValue>
																		</SelectTrigger>
																		<SelectContent />
																	</Select>
																</div>
																<div>
																	<h5 class="text-lg font-semibold">
																		Tag group filter
																	</h5>
																	<Select
																		value={tagGroupSelect()}
																		onChange={(e) => {
																			if (!e) {
																				setFilterTagGroup(null);
																				setTagGroupSelect("All");
																				return;
																			}

																			const temp =
																				tagGroups.data?.find(
																					(el) => el.tagGroup === e,
																				)?.id || null;

																			setFilterTagGroup(temp);
																			setTagGroupSelect(e);
																			return;
																		}}
																		options={[
																			"All",
																			...tagGroups.data?.map((e) => e.tagGroup),
																		]}
																		placeholder="Tag group"
																		itemComponent={(props) => (
																			<SelectItem item={props.item}>
																				{props.item.rawValue}
																			</SelectItem>
																		)}
																	>
																		<SelectTrigger
																			aria-label="Tag group"
																			class="w-[180px]"
																		>
																			<SelectValue<string>>
																				{(state) => state.selectedOption()}
																			</SelectValue>
																		</SelectTrigger>
																		<SelectContent />
																	</Select>
																</div>
															</div>
														</div>
													</DialogContent>
												</Dialog>
											</BackNav>
										</div>
									</div>

									<BackNav open={dayEditorOpen()} setOpen={setDayEditorOpen}>
										<Dialog
											open={dayEditorOpen()}
											onOpenChange={() => setDayEditorOpen(!dayEditorOpen())}
										>
											<DialogTrigger></DialogTrigger>
											<DialogContent>
												<DayEditor
													hoursWorkedPrev={hours.data?.hoursWorked || 0}
													setDayEditorOpen={setDayEditorOpen}
													selectedDate={curDate()}
													projectId={curProjectId()}
												/>
											</DialogContent>
										</Dialog>
									</BackNav>
									<div class="flex w-11/12 flex-col items-center justify-center gap-4">
										<For each={doneTodos.data?.pages}>
											{(page) => (
												<Show when={page}>
													{(pageEl) => (
														<For each={pageEl().doneTodos}>
															{(todoDone) => (
																<div class="flex size-full min-h-28 items-start justify-between rounded-lg border border-t-2 border-gray-200 bg-white p-4 shadow-md">
																	<div class="flex min-h-24 flex-col items-start justify-between">
																		<p class="mr-2 text-wrap break-words text-left text-sm lg:text-base">
																			{todoDone.todo}
																		</p>
																		<div class="flex items-end justify-start gap-4">
																			{/* TODO these links as new pages with params */}

																			<button
																				type="button"
																				onClick={() => {
																					setFilterTag(todoDone.tagId);
																				}}
																				class="mt-4 text-sm italic"
																			>{`tag: ${todoDone.tag ? todoDone.tag : "none"}`}</button>
																			<button
																				type="button"
																				// onClick={}
																				class="mt-4 text-sm italic"
																			>{`group: ${todoDone.tagGroup}`}</button>
																		</div>
																	</div>
																	<div class="flex items-center justify-center gap-8">
																		<div class="flex min-h-24  flex-col items-start justify-between">
																			<p class="text-sm italic">
																				{todoDone.dateCompleted?.toDateString()}
																			</p>
																			<div class="flex items-center justify-start">
																				<h3 class="text-center font-semibold lg:size-full lg:text-xl">{`${todoDone.hoursWorked ? hoursToFormat(todoDone.hoursWorked).hours : hoursToFormat(0).hours}`}</h3>
																				<Show
																					when={
																						todoDone.hoursWorked
																							? hoursToFormat(
																									todoDone.hoursWorked,
																								).minutes > 0
																							: hoursToFormat(0).minutes
																					}
																				>
																					<span class="text-center font-semibold lg:size-full lg:text-xl">
																						:
																					</span>
																					<h3 class="text-center font-semibold lg:size-full lg:text-xl">{`${todoDone.hoursWorked ? hoursToFormat(todoDone.hoursWorked).minutes : hoursToFormat(0).minutes}`}</h3>
																				</Show>
																				<span class="ml-2 mr-4"> hours</span>
																				<Button
																					onClick={() => {
																						setTodo(todoDone);
																						setSelectedTag(
																							todoDone.tag || "none",
																						);
																						setSelectedTagGroup(
																							todoDone.tagGroup,
																						);
																						setTodoText(todoDone.todo);
																						setTodoEditOpen(true);
																					}}
																					class="flex h-8 w-12 items-center justify-center "
																					variant={"outline"}
																				>
																					Edit
																				</Button>
																			</div>
																		</div>
																	</div>
																</div>
															)}
														</For>
													)}
												</Show>
											)}
										</For>
									</div>
								</div>

								<TodoPanel
									curProjectId={curProjectId()}
									openFirst={openFirst()}
									setOpenFirst={setOpenFirst}
								/>
								<BackNav open={todoEditOpen()} setOpen={setTodoEditOpen}>
									<Dialog open={todoEditOpen()} onOpenChange={setTodoEditOpen}>
										<DialogTrigger></DialogTrigger>
										<DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
											<DialogHeader>
												<DialogTitle class="mx-auto">Edit todo</DialogTitle>
												<DialogDescription>
													If you want to edit hours or date completed just
													delete this todo, and create new one
												</DialogDescription>
											</DialogHeader>
											<Show when={todo()}>
												{(td) => (
													<>
														<button
															type="button"
															onClick={() => {
																deleteTodo.mutate({ todoId: td().id });
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
														<div class="mx-auto flex w-full flex-col items-center justify-between gap-12">
															<TextField
																value={todoText()}
																onChange={setTodoText}
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
																<Show
																	when={tagsActive.data}
																	fallback="No tags found"
																>
																	{(tags) => (
																		<>
																			<Select
																				class="flex"
																				defaultValue={td().tag || "none"}
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
																				defaultValue={td().tagGroup}
																				value={selectedTagGroup()}
																				onChange={setSelectedTagGroup}
																				options={[
																					...massageTagsAndGroupsToArr(
																						tagGroups(),
																					),
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
														</div>
														<DialogFooter class="mx-auto w-full">
															<Button
																onClick={() => {
																	editTodo.mutate({
																		dateCompleted: td().dateCompleted,
																		hoursWorked: td().hoursWorked,
																		todoId: td().id,
																		completed: true,
																		tagId:
																			selectedTag() === "none"
																				? null
																				: tagsActive.data.find(
																						(e) => e.tag === selectedTag(),
																					)?.id,
																		todo: todoText(),
																		tagGroupId: tagGroupsActive.data.find(
																			(e) => e.tagGroup === selectedTagGroup(),
																		)?.id as number,
																	});
																	console.log(todoText(), todo());
																}}
																class="w-full"
																variant={"secondary"}
															>
																Edit
															</Button>
														</DialogFooter>
													</>
												)}
											</Show>
										</DialogContent>
									</Dialog>
								</BackNav>
							</>
						)}
					</Show>
				</Suspense>
			</main>
		</>
	);
}

//TODO should Listmonth do all of the selections of month and showing?
//TODO fetch infinite with intersection observer
