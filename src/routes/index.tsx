import { A } from "@solidjs/router";
import { createSignal, Show, Suspense } from "solid-js";
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
	const [curDate, setCurDate] = createSignal<null | Date>(null);
	const projects = trpc.allProjects.createQuery();

	return (
		<main class="flex flex-col justify-start items-center mx-auto w-full">
			<A href="/testing/test/">Testing</A>
			<Suspense>
				<Show when={projects.data} fallback={<NewProject />}>
					{(data) => (
						<>
							<SidePanel />
							<div class="text-center mx-auto text-gray-700 flex flex-col items-center justify-start w-full gap-6 m-8">
								<h2 class="font-semibold text-lg">{`${monthsArr[curMonth()]} ${curYear()}`}</h2>
								<Suspense>
									<ListMonth
										month={curMonth()}
										year={curYear()}
										projectName={data()[0].name}
										setCurDate={setCurDate}
									/>
								</Suspense>
								<div class="flex justify-center items-center gap-8 w-full">
									<Button
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
									<Button>{`${curMonth() + 1}/${curYear()}`}</Button>
									<Button
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
						</>
					)}
				</Show>
			</Suspense>
		</main>
	);
}

//TODO should Listmonth do all of the selections of month and showing?
