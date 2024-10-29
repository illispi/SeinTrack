import { type Component, Show } from "solid-js";
import { hoursToFormat } from "~/utils/functionsAndVariables";

const MinuteFormat: Component<{ hours: number | null }> = (props) => {
	return (
		<div class="flex h-8 items-center justify-center">
			<Show
				when={props.hours}
				fallback={
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						// class="size-6"
						class=" size-6"
					>
						<path d="M18 6l-12 12" />
						<path d="M6 6l12 12" />
					</svg>
				}
			>
				<h3 class="text-center font-semibold lg:size-full lg:text-xl">{`${props.hours ? hoursToFormat(props.hours).hours : hoursToFormat(0).hours}`}</h3>
				<Show
					when={
						props.hours
							? hoursToFormat(props.hours).minutes > 0
							: hoursToFormat(0).minutes
					}
				>
					<span class="text-center font-semibold lg:size-full lg:text-xl">
						:
					</span>
					<h3 class="text-center font-semibold lg:size-full lg:text-xl">{`${props.hours ? hoursToFormat(props.hours).minutes : hoursToFormat(0).minutes}`}</h3>
				</Show>
			</Show>
		</div>
	);
};

export default MinuteFormat;
