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

const ListMonth: Component<{ month: number; year: number }> = (props) => {
	const [selectedDate, setSelectedDate] = createSignal<Date | null>(null);
	const [curHours, setCurHours] = createSignal(0);

	const utils = trpc.useContext();

	const hours = trpc.getHoursOfDay.createQuery(() =>
		dayAdjust(props.month, props.year),
	);

	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));
	return (
		<div class="flex flex-col justify-start items-center max-w-5xl w-full">
			<div class="grid grid-cols-7 gap-4 w-full place-content-center place-items-center">
				<For each={weekdaysArr}>{(day) => <div>{day}</div>}</For>
				<For each={dayAdjust(props.month, props.year)}>
					{(date, index) => (
						<div class="flex flex-col justify-center items-center w-8 h-16">
							<h5>{date.getDate()}</h5>

							<Suspense fallback={<div class="w-full h-full" />}>
								<Show when={hours.data}>
									{(hours) => (
										<Button
											class={clsx()}
											variant={
												selectedDate() === hours()[index()].date
													? "secondary"
													: "default"
											}
											type="button"
											onClick={() =>
												selectedDate() === hours()[index()].date
													? setSelectedDate(null)
													: setSelectedDate(hours()[index()].date)
											}
										>
											<Show when={hours()[index()].hours} fallback={"null"}>
												<Show
													//TODO add less than check here
													when={true}
													fallback={
														<svg
															fill="currentColor"
															stroke-width="0"
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 16 16"
															height="1em"
															width="1em"
															style="overflow: visible; color: currentcolor;"
														>
															<title>Failed</title>
															<path
																fill="currentColor"
																d="M15.854 12.854 11 8l4.854-4.854a.503.503 0 0 0 0-.707L13.561.146a.499.499 0 0 0-.707 0L8 5 3.146.146a.5.5 0 0 0-.707 0L.146 2.439a.499.499 0 0 0 0 .707L5 8 .146 12.854a.5.5 0 0 0 0 .707l2.293 2.293a.499.499 0 0 0 .707 0L8 11l4.854 4.854a.5.5 0 0 0 .707 0l2.293-2.293a.499.499 0 0 0 0-.707z"
															/>
														</svg>
													}
												>
													<svg
														fill="currentColor"
														stroke-width="0"
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 16 16"
														height="1em"
														width="1em"
														style="overflow: visible; color: currentcolor;"
													>
														<title>checkmark</title>
														<path
															fill="currentColor"
															d="M13.5 2 6 9.5 2.5 6 0 8.5l6 6 10-10z"
														/>
													</svg>
												</Show>
											</Show>
										</Button>
									)}
								</Show>
							</Suspense>
						</div>
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
					onClick={() =>
						changeHours.mutate({
							date: selectedDate(),
							hours: Number(curHours()),
						})
					}
				>
					Change hours
				</Button>
			</div>
		</div>
	);
};

export default ListMonth;
