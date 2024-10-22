import {
	type Component,
	Show,
	Suspense,
	createEffect,
	createSignal,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import AddTime from "./AddTime";
import { Button } from "./ui/button";
import { Toaster, showToast } from "./ui/toast";
import { keepPreviousData } from "@tanstack/solid-query";

const DayEditor: Component<{
	selectedDate: Date;
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
		<Suspense fallback="fkwaåpofwaopåfkawf">
			<div class="mx-auto flex w-full max-w-72 flex-col items-center justify-start gap-6">
				<h4 class="text-3xl font-light">{props.selectedDate.toDateString()}</h4>
				<h3>{`Current hours: ${hours.data?.hoursWorked || 0}`}</h3>
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
