import { For, Show, type Component } from "solid-js";
import { isSunday, isTuesday } from "date-fns";

const yearChange = (year: number, month: number, forward: boolean) => {
	if (month === 11 && forward) {
		return { month: 0, year: year + 1 };
	}
	if (month === 0 && !forward) {
		return { month: 11, year: year - 1 };
	}

	return { month, year };
};

const dayAdjust = (month: number, year: number) => {
	const adjustYearPos = yearChange(year, month, true);
	const adjustYearNeg = yearChange(year, month, false);

	const firstDay = new Date(year, month, 1).getDay();
	const lastDayPreviousMonth = new Date(new Date(year, month, 1) - 1).getDate();

	const DayAmountCur = new Date(new Date(year, month + 1, 1) - 1).getDate();

	const daysBehind = firstDay === 0 ? 6 : firstDay - 1;

	const daysArr = [];
	for (let i = 0; i < daysBehind; i++) {
		daysArr.push(
			new Date(
				adjustYearNeg.year,
				adjustYearNeg.month === 11 ? 11 : adjustYearNeg.month - 1,
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
	const weekdays = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];
	return (
		<div class="grid grid-cols-7 gap-4 max-w-5xl">
			<For each={weekdays}>{(day) => <div>{day}</div>}</For>
			<For each={dayAdjust(props.month, props.year)}>
				{(date) => (
					<div class="flex flex-col justify-start items-center">
						<h5>{date.getDate()}</h5>
						<Show when={true} fallback={""}>
							<Show
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
					</div>
				)}
			</For>
		</div>
	);
};

export default ListMonth;
