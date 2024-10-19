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
		<div class="">
			<Show when={props.selectedDate} fallback="No date selected">
				{(date) => (
					<div class="flex flex-col gap-8 rounded-lg border border-t-4 border-gray-200 border-t-green-500 bg-white  p-4 text-lg shadow-lg">
						<h4 class="text-3xl font-light">{date().toDateString()}</h4>
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
