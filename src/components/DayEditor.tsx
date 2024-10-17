import { type Component, Show, createEffect, createSignal } from "solid-js";
import { trpc } from "~/utils/trpc";
import AddTime from "./AddTime";
import { Button } from "./ui/button";
import { Toaster, showToast } from "./ui/toast";

const DayEditor: Component<{
	selectedDate: Date | null;
	projectName: string;
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
		}
	});

	const utils = trpc.useContext();
	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
			setAddHours(0);
			setAddMinutes(0);
		},
	}));
	return (
		<div>
			<Show when={props.selectedDate} fallback="No date selected">
				{(date) => (
					<div class="flex flex-col gap-4 text-lg">
						{date().toDateString()}
						<div class="flex w-full flex-col items-center justify-center gap-4">
							<AddTime
								hours={addHours()}
								minutes={addMinutes()}
								setHours={setAddHours}
								setMinutes={setAddMinutes}
							/>

							<Button
								variant={"outline"}
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
