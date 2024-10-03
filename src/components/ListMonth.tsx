import { For, type Component } from "solid-js";
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
		daysArr.push(lastDayPreviousMonth - daysBehind + i);
	}
	for (let i = 0; i < DayAmountCur; i++) {
		daysArr.push(new Date(year, month, i + 1).getDate());
	}
	const daysForward = 6 * 7 - daysArr.length;
	for (let i = 0; i < daysForward; i++) {
		daysArr.push(
			new Date(adjustYearPos.year, adjustYearPos.month, i + 1).getDate(),
		);
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
				{(date, index) => <div>{date}</div>}
			</For>
		</div>
	);
};

export default ListMonth;
