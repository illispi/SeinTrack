import { Show, type Component } from "solid-js";
import { hoursToFormat } from "~/utils/functionsAndVariables";

const FormatTime: Component<{ hours: number }> = (props) => {
	return (
		<>
			<h3 class="text-center font-semibold lg:size-full lg:text-xl">{`${props.hours ? hoursToFormat(props.hours).hours : hoursToFormat(0).hours}`}</h3>
			<Show
				when={
					props.hours
						? hoursToFormat(props.hours).minutes > 0
						: hoursToFormat(0).minutes
				}
			>
				<span class="text-center font-semibold lg:size-full lg:text-xl">:</span>
				<h3 class="text-center font-semibold lg:size-full lg:text-xl">{`${props.hours ? hoursToFormat(props.hours).minutes : hoursToFormat(0).minutes}`}</h3>
			</Show>
		</>
	);
};

export default FormatTime;
