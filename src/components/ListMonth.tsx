import {
	createEffect,
	createSignal,
	ErrorBoundary,
	For,
	Setter,
	Show,
	Suspense,
	type Component,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import clsx from "clsx";
import { Button } from "./ui/button";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import {
	adjustDateByOne,
	firstDateFunc,
	latestDateFunc,
	weekdaysArr,
} from "~/utils/functionsAndVariables";
import { createStore } from "solid-js/store";

export const dayAdjust = (month: number, year: number) => {
	const adjustYearPos = adjustDateByOne(year, month, true);
	const adjustYearNeg = adjustDateByOne(year, month, false);

	const firstDay = new Date(year, month, 1).getDay();
	const lastDayPreviousMonth = new Date(
		new Date(year, month, 1).getTime() - 1,
	).getDate();

	const DayAmountCur = new Date(
		new Date(year, month + 1, 1).getTime() - 1,
	).getDate();

	const daysBehind = firstDay === 0 ? 6 : firstDay - 1;

	const daysArr = [];
	for (let i = 0; i < daysBehind; i++) {
		daysArr.push(
			new Date(
				adjustYearNeg.year,
				adjustYearNeg.month,
				lastDayPreviousMonth - daysBehind + i + 1,
			),
		);
	}
	for (let i = 0; i < DayAmountCur; i++) {
		daysArr.push(new Date(year, month, i + 1));
	}
	const daysForward = 6 * 7 - daysArr.length;
	for (let i = 0; i < daysForward; i++) {
		daysArr.push(new Date(adjustYearPos.year, adjustYearPos.month, i + 1));
	}

	return daysArr;
};

const isCountedDay = (
	date: Date,
	latestDate: Date | null | undefined,
	firstDate: Date | null | undefined,
	countingDays: number[],
) => {
	if (!latestDate || !firstDate) {
		return false;
	}
	const countedDay = countingDays.includes(date.getDay());

	if (date <= latestDate && date >= firstDate && countedDay) {
		return true;
	}
	return false;
};

const ListMonth: Component<{
	month: number;
	year: number;
	projectName: string;
	setCurDate: Setter<Date | null>;
}> = (props) => {
	const [countedDays, setCountedDays] = createStore([1, 2, 3, 4, 5]);

	const firstAndLastDate = trpc.getFirstAndLastDate.createQuery(
		() => props.projectName,
	);

	createEffect(() => {
		props.setCurDate(selectedDate());
	});

	const [selectedDate, setSelectedDate] = createSignal<Date | null>(null);
	const [curHours, setCurHours] = createSignal(0);

	const utils = trpc.useContext();

	const hours = trpc.getHoursOfDay.createQuery(() => ({
		dates: dayAdjust(props.month, props.year),
		projectName: props.projectName,
	}));

	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));
	return (
		<div class="flex flex-col justify-start items-center max-w-5xl w-full">
			<div class="grid grid-cols-7 w-full place-content-center place-items-center">
				<For each={weekdaysArr}>{(day) => <div>{day}</div>}</For>
				<For each={dayAdjust(props.month, props.year)}>
					{(date, index) => (
						<Show when={hours.data}>
							{(data) => (
								<button
									type="button"
									onClick={() => {
										selectedDate() === data()[index()].date
											? setSelectedDate(null)
											: setSelectedDate(data()[index()].date);
									}}
									class={clsx(
										selectedDate() === data()[index()].date
											? "bg-black active:bg-black hover:bg-black"
											: "bg-white",
										"flex flex-col justify-start items-center w-full h-16 border border-gray-200 hover:bg-gray-300 transition-all duration-300",
									)}
								>
									<h5
										class={clsx(
											"text-md font-normal",
											selectedDate() === data()[index()].date
												? "text-white"
												: "text-black",
										)}
									>
										{date.getDate()}
									</h5>

									<Suspense fallback={<div class="w-full h-full" />}>
										<div>
											<Show
												when={
													isCountedDay(
														data()[index()].date,
														firstAndLastDate.data?.lastDate,
														firstAndLastDate.data?.firstDate,
														countedDays,
													) || data()[index()].hours > 3
												}
												fallback=""
											>
												<Show
													//TODO add less than check here
													when={
														data()[index()].hours
															? data()[index()].hours > 3
															: false
													}
													fallback={
														<h3 class="text-red-500 text-3xl font-semibold">{`${data()[index()].hours ? data()[index()].hours : 0}`}</h3>
													}
												>
													<h3 class="text-green-500 text-3xl font-semibold">{`${data()[index()].hours}`}</h3>
												</Show>
											</Show>
										</div>
									</Suspense>
								</button>
							)}
						</Show>
					)}
				</For>
			</div>
			<div class="w-full flex flex-col items-center justify-center">
				<TextField>
					<TextFieldLabel for="email">Hours</TextFieldLabel>
					<TextFieldInput
						type="number"
						onInput={(e) => {
							setCurHours(e.target.value);
						}}
					/>
				</TextField>
				<Button
					type="button"
					onClick={() => {
						if (selectedDate()) {
							changeHours.mutate({
								date: selectedDate(),
								hours: Number(curHours()),
								projectName: props.projectName,
							});
						}
					}}
				>
					Change hours
				</Button>
			</div>
		</div>
	);
};

export default ListMonth;
