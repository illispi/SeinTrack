import {
	createSignal,
	ErrorBoundary,
	For,
	Show,
	Suspense,
	type Component,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import clsx from "clsx";
import { Button } from "./ui/button";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { adjustDateByOne, weekdaysArr } from "~/utils/functionsAndVariables";

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

const ListMonth: Component<{
	month: number;
	year: number;
	projectName: string;
}> = (props) => {
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
						<button
							type="button"
							onClick={() =>
								selectedDate() === hours.data[index()].date
									? setSelectedDate(null)
									: setSelectedDate(hours.data[index()].date)
							}
							class="flex flex-col justify-start items-center w-full h-16 border border-slate-200 hover:bg-slate-300 transition-all duration-300"
						>
							<h5 class="text-lg font-semibold">{date.getDate()}</h5>

							<Suspense fallback={<div class="w-full h-full" />}>
								<Show when={hours.data}>
									{(hours) => (
										<div>
											<Show when={hours()[index()].hours} fallback="">
												<Show
													//TODO add less than check here
													when={true}
													fallback={
														<svg
															class="fill-red-500"
															stroke-width="0"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 16 16"
															height="2.0em"
															width="2.0em"
															style="overflow: visible; color: currentcolor;"
														>
															<title>Failed</title>
															<path
																class="fill-red-500"
																d="M15.854 12.854 11 8l4.854-4.854a.503.503 0 0 0 0-.707L13.561.146a.499.499 0 0 0-.707 0L8 5 3.146.146a.5.5 0 0 0-.707 0L.146 2.439a.499.499 0 0 0 0 .707L5 8 .146 12.854a.5.5 0 0 0 0 .707l2.293 2.293a.499.499 0 0 0 .707 0L8 11l4.854 4.854a.5.5 0 0 0 .707 0l2.293-2.293a.499.499 0 0 0 0-.707z"
															/>
														</svg>
													}
												>
													<svg
														class="fill-green-500"
														stroke-width="0"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 16 16"
														height="2.0em"
														width="2.0em"
														style="overflow: visible; color: currentcolor;"
													>
														<title>checkmark</title>
														<path
															class="fill-green-500"
															d="M13.5 2 6 9.5 2.5 6 0 8.5l6 6 10-10z"
														/>
													</svg>
												</Show>
											</Show>
										</div>
									)}
								</Show>
							</Suspense>
						</button>
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
