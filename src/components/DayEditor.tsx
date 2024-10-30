import JSConfetti from "js-confetti";
import {
	type Component,
	type Setter,
	Suspense,
	createEffect,
	createSignal,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import AddTime from "./AddTime";
import { Button } from "./ui/button";
import { Toaster, showToast } from "./ui/toast";

const DayEditor: Component<{
	selectedDate: Date;
	projectId: number;
	setDayEditorOpen: Setter<boolean>;
	hoursWorkedPrev: number;
}> = (props) => {
	const [addHours, setAddHours] = createSignal(0);
	const [addMinutes, setAddMinutes] = createSignal(0);
	const [lastSelectedDate, setLastSelectedDate] = createSignal(
		props.selectedDate,
	);

	const [active, setActive] = createSignal(false);

	const jsConfetti = new JSConfetti();
	const audio = new Audio("victory.wav");

	const targetHours = trpc.getTargetHours.createQuery(() => props.projectId);

	createEffect(() => {
		if (lastSelectedDate() !== props.selectedDate) {
			setAddHours(0);
			setAddMinutes(0);
		}
		if (changeHours.isError) {
			showToast({
				title: "ERROR!",
				description: changeHours.error?.message,
				variant: "error",
			});
			changeHours.reset();
		}
		if (hours.isError) {
			showToast({
				title: "ERROR!",
				description: hours.error?.message,
				variant: "error",
			});
		}
		const test = hours.data?.hoursWorked || 0;
		if (
			test < targetHours.data?.targetHours &&
			test + addHours() + addMinutes() / 60 >= targetHours.data?.targetHours &&
			active()
		) {
			jsConfetti.addConfetti();
			audio.play();
			setActive(false);
		}
	});

	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => {
			setActive(true);
			setAddHours(0);
			setAddMinutes(0);
			props.setDayEditorOpen(false);
		},
	}));

	const zeroTimer = trpc.zeroTimer.createMutation(() => ({
		onSuccess: () => {
			setAddHours(0);
			setAddMinutes(0);
			props.setDayEditorOpen(false);
		},
	}));

	const hours = trpc.getHoursForDate.createQuery(() => ({
		date: props.selectedDate,
		projectId: props.projectId,
	}));

	return (
		<Suspense>
			<button
				type="button"
				onClick={() => {
					if (props.selectedDate) {
						zeroTimer.mutate({
							date: props.selectedDate,
							projectId: props.projectId,
						});
					}
				}}
				class="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground"
			>
				<svg
					fill="currentColor"
					stroke-width="0"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1024 1024"
					height="1em"
					width="1em"
					style="overflow: visible; color: currentcolor;"
					class="size-6"
				>
					<path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-200 0H360v-72h304v72z"></path>
				</svg>
			</button>
			<div class="mx-auto flex w-full max-w-72 flex-col items-center justify-start gap-6">
				<h4 class="text-3xl font-light">{props.selectedDate.toDateString()}</h4>
				<Suspense fallback={<h3 class="text-3xl">...</h3>}>
					<h3 class="text-3xl">{`${hours.data?.hoursWorked ? Math.floor(hours.data.hoursWorked) : 0} h ${hours.data?.hoursWorked ? Number((hours.data.hoursWorked % 1).toFixed(2)) * 60 : 0} min`}</h3>
				</Suspense>
				<div class="flex w-full flex-col items-center justify-center gap-8">
					<AddTime
						hours={addHours()}
						minutes={addMinutes()}
						setHours={setAddHours}
						setMinutes={setAddMinutes}
					/>

					<Button
						class="w-full "
						variant={"secondary"}
						type="button"
						onClick={() => {
							if (props.selectedDate) {
								changeHours.mutate({
									date: props.selectedDate,
									hours: Number(
										Number(addHours() + addMinutes() / 60).toFixed(2),
									),
									projectId: props.projectId,
								});
							}
						}}
					>
						Add time
					</Button>

					<Toaster />
				</div>
			</div>
		</Suspense>
	);
};

export default DayEditor;
