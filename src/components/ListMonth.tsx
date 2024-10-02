import { For, type Component } from "solid-js";

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

	const firstDay = new Date(year, month, 0).getDay();
	const lastDayPreviousMonth = new Date(new Date(year, month, 1) - 1).getDate();

	const DayAmountCur = new Date(new Date(year, month + 1, 1) - 1).getDate();
	const lastDay = new Date(year, month, DayAmountCur).getDay();

	const daysBehind = firstDay === 0 ? 6 : firstDay - 1;
	const daysForward = lastDay === 0 ? 0 : 7 - lastDay + 1;

	const daysArr = [];
	for (let i = 0; i < daysBehind; i++) {
		daysArr.push(lastDayPreviousMonth - i);
	}
	for (let i = 0; i < DayAmountCur; i++) {
		daysArr.push(new Date(year, month, i).getDate());
	}
	for (let i = 0; i < daysForward; i++) {
		daysArr.push(
			new Date(adjustYearPos.year, adjustYearPos.month, i).getDate(),
		);
	}

	return daysArr;
};

const daysInGrid = (year: number, month: number) => {
	const days = new Date(year, month, 0).getDate();
	const weekdays = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	return Array.from({ length: days }, (_, i) => i + 1);
};

const ListMonth: Component<{ month: number; year: number }> = (props) => {
	return (
		<div class="grid grid-cols-7 gap-4 max-w-5xl">
			<For each={dayAdjust(props.month, props.year)}>
				{(days, index) => <div>{days}</div>}
			</For>
		</div>
	);
};

export default ListMonth;
