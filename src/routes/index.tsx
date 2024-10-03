import { createSignal, Suspense } from "solid-js";
import ListMonth from "~/components/ListMonth";
import { Button } from "~/components/ui/button";
import { trpc } from "~/utils/trpc";

const adjustDateByOne = (year: number, month: number, forward: boolean) => {
	if (month === 11 && forward) {
		return { month: 0, year: year + 1 };
	}
	if (month === 0 && !forward) {
		return { month: 11, year: year - 1 };
	}

	if (forward) {
		return { month: month + 1, year };
	}

	return { month: month - 1, year };
};

export default function Home() {
	const [curMonth, setCurMonth] = createSignal(new Date().getMonth());
	const [curYear, setCurYear] = createSignal(new Date().getFullYear());

	return (
		<main class="text-center mx-auto text-gray-700 p-4 flex items-center justify-start w-full">
			<Suspense>
				<ListMonth month={curMonth()} year={curYear()} />
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
			</Suspense>
		</main>
	);
}
