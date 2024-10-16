import { Show, type Component } from "solid-js";
import { hoursToFormat } from "~/utils/functionsAndVariables";

const MinuteFormat: Component<{ hours: number | null }> = (props) => {
	return (
		<div class="flex justify-end items-end h-full">
			<Show
				when={props.hours}
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
						<title>"Cross</title>
						<path
							fill="currentColor"
							d="M15.854 12.854 11 8l4.854-4.854a.503.503 0 0 0 0-.707L13.561.146a.499.499 0 0 0-.707 0L8 5 3.146.146a.5.5 0 0 0-.707 0L.146 2.439a.499.499 0 0 0 0 .707L5 8 .146 12.854a.5.5 0 0 0 0 .707l2.293 2.293a.499.499 0 0 0 .707 0L8 11l4.854 4.854a.5.5 0 0 0 .707 0l2.293-2.293a.499.499 0 0 0 0-.707z"
						/>
					</svg>
				}
			>
				<h3 class="lg:text-2xl font-semibold">{`${props.hours ? hoursToFormat(props.hours).hours : hoursToFormat(0).hours}`}</h3>
				<span class="lg:text-lg font-extralight">{"h "}</span>
				<Show
					when={
						props.hours
							? hoursToFormat(props.hours).minutes > 0
							: hoursToFormat(0).minutes
					}
				>
					<h3 class="lg:text-2xl font-semibold">{`${props.hours ? hoursToFormat(props.hours).minutes : hoursToFormat(0).minutes}`}</h3>
					<span class="lg:text-lg font-extralight">{"m"}</span>
				</Show>
			</Show>
		</div>
	);
};

export default MinuteFormat;
