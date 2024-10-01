import { For, type Component } from "solid-js";

const daysInMonth = (year: number, month: number) => {
	const days = new Date(year, month, 0).getDate();
	return Array.from({ length: days }, (_, i) => i + 1);
};

const ListMonth: Component<{ month: number; year: number }> = (props) => {
	return (
		<div>
			<For each={daysInMonth(props.year, props.month)}>
				{(days, index) => <div>{days}</div>}
			</For>
		</div>
	);
};

export default ListMonth;
