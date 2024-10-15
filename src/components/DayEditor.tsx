import { Show, type Component } from "solid-js";

const DayEditor: Component<{ date: Date | null }> = (props) => {
	return (
		<div>
			<Show when={props.date} fallback="No date selected">
				{(date) => <div class="text-lg">{date().toDateString()}</div>}
			</Show>
		</div>
	);
};

export default DayEditor;
