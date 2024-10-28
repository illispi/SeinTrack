import clsx from "clsx";
import {
	type Component,
	For,
	type Setter,
	Show,
	Suspense,
	createEffect,
	createSignal,
} from "solid-js";
import { createStore } from "solid-js/store";
import {
	adjustDateByOne,
	weekdaysArr,
	weekdaysShortHandArr,
} from "~/utils/functionsAndVariables";
import { trpc } from "~/utils/trpc";
import MinuteFormat from "./MinuteFormat";

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

const colorPicker = (
	targetHours: number,
	iterDate: Date,
	firstDate: Date,
	lastDate: Date,
	hours: number,
	countedDays: number[],
) => {
	if (isCountedDay(iterDate, lastDate, firstDate, countedDays) || hours > 0) {
		if (
			hours >= targetHours ||
			!isCountedDay(iterDate, lastDate, firstDate, countedDays)
		) {
			return "bg-green-300";
		}
		return "bg-red-300";
	}
	return "bg-white";
};

const ListMonth: Component<{
	month: number;
	year: number;
	projectId: number;
	setCurDate: Setter<Date>;
	curDate: Date;
	setDayEditorOpen: Setter<boolean>;
}> = (props) => {
	const firstAndLastDate = trpc.getFirstAndLastDate.createQuery(() => ({
		projectId: props.projectId,
	}));

	createEffect(() => {
		props.setCurDate(selectedDate());
	});

	const [selectedDate, setSelectedDate] = createSignal<Date>(props.curDate);

	const hours = trpc.getHoursOfDay.createQuery(() => ({
		dates: dayAdjust(props.month, props.year),
		projectId: props.projectId,
	}));

	const activeDays = trpc.getActiveDays.createQuery(() => props.projectId);

	const targetHours = trpc.getTargetHours.createQuery(() => props.projectId);

	return (
		<div class="flex w-11/12 max-w-5xl flex-col items-center justify-start ">
			<div class="grid w-full grid-cols-7 place-content-center place-items-center">
				<For each={weekdaysArr}>
					{(day) => <div class="hidden pb-6 2xl:block">{day}</div>}
				</For>
				<For each={weekdaysShortHandArr}>
					{(day) => <div class="block pb-6 2xl:hidden">{day}</div>}
				</For>
			</div>
			<div class="grid w-full grid-cols-7 place-content-center place-items-center shadow-md">
				<For each={dayAdjust(props.month, props.year)}>
					{(date, index) => (
						<Show when={hours.data}>
							{(data) => (
								<button
									type="button"
									onClick={() => {
										setSelectedDate(data()[index()].date);

										props.setDayEditorOpen(true);
									}}
									class={clsx(
										colorPicker(
											targetHours.data?.targetHours,
											// selectedDate(),
											data()[index()].date,
											firstAndLastDate.data?.firstDate,
											firstAndLastDate.data?.lastDate,
											data()[index()].hours,
											activeDays.data.map((e) => e.day),
										),

										index() === 0 ? "rounded-ss-lg border-t" : "",
										index() < 7 && index() > 0 ? "border-t" : "",
										index() % 7 === 0 ? "border-l" : "",
										index() !== 6 || "rounded-se-lg",
										index() !== 41 || "rounded-ee-lg",
										index() !== 35 || "rounded-es-lg",
										"flex h-16 w-full flex-col items-center justify-around border-b border-r border-gray-600 transition-all duration-300 hover:bg-slate-300",
									)}
								>
									<div class="flex size-full flex-col items-center justify-start">
										<h5
											class={clsx(
												date.toDateString() === new Date().toDateString()
													? "size-6 rounded-full bg-black text-center text-white"
													: "size-6",
											)}
										>
											{date.getDate()}
										</h5>

										<Suspense fallback={<div class="size-full" />}>
											<div>
												<Show
													when={
														isCountedDay(
															data()[index()].date,
															firstAndLastDate.data?.lastDate,
															firstAndLastDate.data?.firstDate,
															activeDays.data.map((e) => e.day),
														) || data()[index()].hours > 0
													}
													fallback=""
												>
													<Show
														when={
															data()[index()].hours >=
																targetHours.data?.targetHours ||
															!isCountedDay(
																data()[index()].date,
																firstAndLastDate.data?.lastDate,
																firstAndLastDate.data?.firstDate,
																activeDays.data.map((e) => e.day),
															)
														}
														fallback={
															<MinuteFormat hours={data()[index()].hours} />
														}
													>
														<MinuteFormat hours={data()[index()].hours} />
													</Show>
												</Show>
											</div>
										</Suspense>
									</div>
								</button>
							)}
						</Show>
					)}
				</For>
			</div>
		</div>
	);
};

export default ListMonth;
