import { A } from "@solidjs/router";
import { Show, Suspense, createSignal } from "solid-js";
import DayEditor from "~/components/DayEditor";
import ListMonth from "~/components/ListMonth";
import NewProject from "~/components/NewProject";
import SidePanel from "~/components/SidePanel";
import { Button } from "~/components/ui/button";
import { adjustDateByOne, monthsArr } from "~/utils/functionsAndVariables";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const [curMonth, setCurMonth] = createSignal(new Date().getMonth());
	const [curYear, setCurYear] = createSignal(new Date().getFullYear());
	const [curDate, setCurDate] = createSignal<null | Date>(new Date());
	const projects = trpc.allProjects.createQuery();

	return (
		<>
			<A href="/testing/test/">Testing</A>
			<main class="mx-auto flex w-full items-start justify-center lg:grid lg:grid-cols-[1fr_3fr] 2xl:grid-cols-[1fr_2fr_1fr]">
				<Suspense>
					<Show when={projects.data} fallback={<NewProject />}>
						{(data) => (
							<>
								<SidePanel>
									<div class="m-8 mx-auto flex w-full flex-col items-center justify-start gap-6 text-center text-gray-700">
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
										<div class="flex w-full items-center justify-center gap-8">
											<Button
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
												variant={"outline"}
											>{`${curMonth() + 1}/${curYear()}`}</Button>
											<Button
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
								</SidePanel>
							</>
						)}
					</Show>
				</Suspense>
			</main>
		</>
	);
}

//TODO should Listmonth do all of the selections of month and showing?
