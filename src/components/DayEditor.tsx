import { type Component, Show, createEffect, createSignal } from "solid-js";
import { trpc } from "~/utils/trpc";
import AddTime from "./AddTime";
import { Button } from "./ui/button";
import { Toaster, showToast } from "./ui/toast";
import { dayAdjust } from "./ListMonth";

const DayEditor: Component<{
	selectedDate: Date | null;
	projectId: number;
}> = (props) => {
	const [addHours, setAddHours] = createSignal(0);
	const [addMinutes, setAddMinutes] = createSignal(0);
	const [lastSelectedDate, setLastSelectedDate] = createSignal(
		props.selectedDate,
	);
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
	});

	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => {
			setAddHours(0);
			setAddMinutes(0);
		},
	}));

	const hours = trpc.getHoursForDate.createQuery(() => ({
		date: props.selectedDate,
		projectId: props.projectId,
	}));

	return (
		<div>
			<Show when={props.selectedDate} fallback="No date selected">
				{(date) => (
					<div class="mx-auto flex w-full max-w-72 flex-col items-center justify-start gap-6">
						<h4 class="text-3xl font-light">{date().toDateString()}</h4>
						<h3>{`Current hours: ${hours.data}`}</h3>
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
											projectName: props.projectName,
										});
									}
								}}
							>
								Add time
							</Button>

							<Toaster />
						</div>
					</div>
				)}
			</Show>
		</div>
	);
};

export default DayEditor;
