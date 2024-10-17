import { type Component, For, type Setter } from "solid-js";
import { Button } from "./ui/button";

const AddTime: Component<{
	hours: number;
	minutes: number;
	setHours: Setter<number>;
	setMinutes: Setter<number>;
}> = (props) => {
	return (
		<div class="flex flex-col items-center justify-center gap-4">
			<div class="flex w-full items-center justify-around">
				<Button
					variant={"outline"}
					onClick={() =>
						props.hours > 0 ? props.setHours(props.hours - 1) : null
					}
				>
					<svg
						fill="currentColor"
						stroke-width="0"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1024 1024"
						height="1em"
						width="1em"
						style="overflow: visible; color: currentcolor;"
					>
						<title>arrow</title>
						<path d="M862 465.3h-81c-4.6 0-9 2-12.1 5.5L550 723.1V160c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v563.1L255.1 470.8c-3-3.5-7.4-5.5-12.1-5.5h-81c-6.8 0-10.5 8.1-6 13.2L487.9 861a31.96 31.96 0 0 0 48.3 0L868 478.5c4.5-5.2.8-13.2-6-13.2z" />
					</svg>
				</Button>
				<h4>{`${props.hours}h ${props.minutes} min`}</h4>
				<Button
					variant={"outline"}
					onClick={() =>
						props.hours < 24 ? props.setHours(props.hours + 1) : null
					}
				>
					<svg
						fill="currentColor"
						stroke-width="0"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1024 1024"
						height="1em"
						width="1em"
						style="overflow: visible; color: currentcolor;"
					>
						<title>arrow</title>

						<path d="M868 545.5 536.1 163a31.96 31.96 0 0 0-48.3 0L156 545.5a7.97 7.97 0 0 0 6 13.2h81c4.6 0 9-2 12.1-5.5L474 300.9V864c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V300.9l218.9 252.3c3 3.5 7.4 5.5 12.1 5.5h81c6.8 0 10.5-8 6-13.2z" />
					</svg>
				</Button>
			</div>
			<div class="flex items-center justify-center gap-2">
				<For each={new Array(4)}>
					{(_, i) => (
						<Button
							variant={"outline"}
							onClick={() => props.setMinutes(i() * 15)}
						>{`${i() * 15}min`}</Button>
					)}
				</For>
			</div>
		</div>
	);
};

export default AddTime;
