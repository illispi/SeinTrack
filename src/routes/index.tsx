import {
	A,
	type BeforeLeaveEventArgs,
	useBeforeLeave,
	useSearchParams,
} from "@solidjs/router";
import { For, Show, Suspense, createEffect, createSignal } from "solid-js";
import DayEditor from "~/components/DayEditor";
import ListMonth from "~/components/ListMonth";
import MenuPanel from "~/components/MenuPanel";
import NewProject from "~/components/NewProject";
import TodoPanel from "~/components/TodoPanel";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { adjustDateByOne, monthsArr } from "~/utils/functionsAndVariables";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const [curMonth, setCurMonth] = createSignal(new Date().getMonth());
	const [curYear, setCurYear] = createSignal(new Date().getFullYear());
	const [curDate, setCurDate] = createSignal<Date>(new Date());
	const [openFirst, setOpenFirst] = createSignal(false);

	const [dayEditorOpen, setDayEditorOpen] = createSignal(false);
	//TODO remove hard coding project id
	const [curProjectId, setProjectId] = createSignal(1);
	const completedTodos = trpc.getDoneTodosByMonth.createQuery(() => ({
		month: curMonth(),
		projectId: curProjectId(),
		year: curYear(),
	}));
	const projects = trpc.allProjects.createQuery();

	const [searchParams, setSearchParams] = useSearchParams();

	useBeforeLeave((event: BeforeLeaveEventArgs) => {
		//BUG on brave, try prevent default and event.retry at start and end of function
		//TODO test this more on mobile as well
		if (
			dayEditorOpen() &&
			Number.isInteger(event.to) &&
			(event.to as number) < 0
		) {
			setDayEditorOpen(false);
		}
	});

	createEffect(() => {
		if (dayEditorOpen()) {
			setSearchParams({ backHistoryFirstEditor: true });
		} else {
			setSearchParams({ backHistoryFirstEditor: null });
		}
	});

	return (
		<>
			<A class="fixed bottom-0 left-0" href="/testing/test/">
				Testing
			</A>
			<div class="sticky top-0 mx-auto flex h-12 w-full items-center justify-between bg-gradient-to-t from-green-500 to-green-400">
				<div class="flex-1"></div>
				<div class="flex divide-x-8 divide-green-400 overflow-hidden rounded-full lg:hidden">
					<Button class="rounded-none bg-white">
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
						class="rounded-none bg-white"
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
			<main class="mx-auto flex w-full items-start justify-center lg:grid lg:grid-cols-[3fr_5fr_3fr]">
				<Suspense>
					<Show when={projects.data} fallback={<NewProject />}>
						{(data) => (
							<>
								<MenuPanel />
								<div
									class="m-8 mx-auto flex w-full flex-col items-center justify-start 
										   gap-6 text-center text-gray-700"
								>
									<h2 class="text-lg font-semibold">{`${monthsArr[curMonth()]} ${curYear()}`}</h2>
									<Suspense>
										<ListMonth
											setDayEditorOpen={setDayEditorOpen}
											month={curMonth()}
											year={curYear()}
											projectId={data()[0].id}
											setCurDate={setCurDate}
											curDate={curDate()}
										/>
									</Suspense>
									<div class="flex w-11/12 max-w-96 flex-col gap-4">
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
										<Dialog
											open={dayEditorOpen()}
											onOpenChange={() => setDayEditorOpen(!dayEditorOpen())}
										>
											<DialogTrigger></DialogTrigger>
											<DialogContent>
												<DayEditor
													selectedDate={curDate()}
													projectId={data()[0].id}
												/>
											</DialogContent>
										</Dialog>
									</div>
									<div class="flex w-11/12 flex-col items-center justify-center gap-4">
										<h2 class="text-lg font-semibold">{`${monthsArr[curMonth()]} ${curYear()}`}</h2>
										<p>Completed todos in a month</p>
										<For each={completedTodos.data}>
											{(todoDone) => (
												<div class="flex h-28 w-full items-start justify-between rounded-lg border border-t-2 border-gray-200 bg-white p-4 shadow-md">
													<div class="flex h-full flex-col items-start justify-between">
														<p class="text-wrap break-words text-left text-sm lg:text-base">
															{todoDone.todo}
														</p>
														<div class="flex items-end justify-start gap-4">
															{/* TODO these links as new pages with params */}

															<A
																href="/TODO"
																class="text-sm italic"
															>{`tag: ${todoDone.tag ? todoDone.tag : "none"}`}</A>
															<A
																href="/TODO"
																class="text-sm italic"
															>{`group: ${todoDone.tagGroup}`}</A>
														</div>
													</div>
													<div class="flex h-full items-center justify-center gap-8">
														<div class="flex h-full flex-col items-start justify-between">
															<p class="text-sm italic">
																{todoDone.dateCompleted?.toDateString()}
															</p>
															<div class="flex items-center justify-start gap-2">
																<p class="text-lg font-semibold">{`${todoDone.hoursWorked}`}</p>
																<p>hours</p>
																<Button
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
									</div>
								</div>
								<TodoPanel
									curProjectId={curProjectId()}
									openFirst={openFirst()}
									setOpenFirst={setOpenFirst}
								/>
							</>
						)}
					</Show>
				</Suspense>
			</main>
		</>
	);
}

//TODO should Listmonth do all of the selections of month and showing?
