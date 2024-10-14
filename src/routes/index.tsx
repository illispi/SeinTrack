import { A } from "@solidjs/router";
import { createSignal, Suspense } from "solid-js";
import ListMonth from "~/components/ListMonth";
import { Button } from "~/components/ui/button";
import { adjustDateByOne, monthsArr } from "~/utils/functionsAndVariables";

export default function Home() {
	const [curMonth, setCurMonth] = createSignal(new Date().getMonth());
	const [curYear, setCurYear] = createSignal(new Date().getFullYear());

	// const [curMonth, setCurMonth] = createSignal(1);
	// const [curYear, setCurYear] = createSignal(2025);

	return (
		<main class="text-center mx-auto text-gray-700 p-4 flex flex-col items-center justify-start w-full gap-6 m-8">
			<A href="/testing/test/">Testing</A>
			<h2 class="font-semibold text-lg">{`${monthsArr[curMonth()]} ${curYear()}`}</h2>
			<Suspense>
				<ListMonth month={curMonth()} year={curYear()} />
			</Suspense>
			<div class="flex justify-center items-center gap-8 w-full">
				<Button
					onClick={() => {
						const back = adjustDateByOne(curYear(), curMonth(), false);
						setCurMonth(back.month);
						setCurYear(back.year);
					}}
				>
					Back
				</Button>
				<Button>{`${curMonth() + 1}/${curYear()}`}</Button>
				<Button
					onClick={() => {
						const forward = adjustDateByOne(curYear(), curMonth(), true);
						setCurMonth(forward.month);
						setCurYear(forward.year);
					}}
				>
					Next
				</Button>
			</div>
		</main>
	);
}
