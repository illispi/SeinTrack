import { A } from "@solidjs/router";
import { For, Show, Suspense, createSignal } from "solid-js";
import DayEditor from "~/components/DayEditor";
import ListMonth from "~/components/ListMonth";
import MenuPanel from "~/components/MenuPanel";
import NewProject from "~/components/NewProject";
import TodoPanel from "~/components/TodoPanel";
import { Button } from "~/components/ui/button";
import { adjustDateByOne, monthsArr } from "~/utils/functionsAndVariables";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const [curMonth, setCurMonth] = createSignal(new Date().getMonth());
	const [curYear, setCurYear] = createSignal(new Date().getFullYear());
	const [curDate, setCurDate] = createSignal<null | Date>(new Date());
	//TODO remove hard coding project id
	const [curProjectId, setProjectId] = createSignal(1);
	const completedTodos = trpc.getDoneTodosByMonth.createQuery(() => ({
		month: curMonth(),
		projectId: curProjectId(),
		year: curYear(),
	}));
	const projects = trpc.allProjects.createQuery();

	return (
		<>
			<A class="fixed bottom-0 left-0" href="/testing/test/">
				Testing
			</A>
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
											month={curMonth()}
											year={curYear()}
											projectName={data()[0].name}
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
										<DayEditor
											selectedDate={curDate()}
											projectName={data()[0].name}
										/>
									</div>
									<div class="flex w-11/12 flex-col items-center justify-center gap-4">
										<h2 class="text-lg font-semibold">{`${monthsArr[curMonth()]} ${curYear()}`}</h2>
										<p>Completed todos in a month</p>
										<For each={completedTodos.data}>
											{(todoDone) => (
												<div class="flex h-28 w-full items-start justify-between rounded-lg border border-t-2 border-gray-200 p-4 shadow-md">
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
								<TodoPanel curProjectId={curProjectId()} />
							</>
						)}
					</Show>
				</Suspense>
			</main>
		</>
	);
}

//TODO should Listmonth do all of the selections of month and showing?
