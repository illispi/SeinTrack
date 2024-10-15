import { createSignal, Show, type Component } from "solid-js";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Button } from "./ui/button";
import { trpc } from "~/utils/trpc";

const DayEditor: Component<{
	selectedDate: Date | null;
	projectName: string;
}> = (props) => {
	const [curHours, setCurHours] = createSignal("");

	const utils = trpc.useContext();
	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
			setCurHours("");
		},
	}));
	return (
		<div>
			<Show when={props.selectedDate} fallback="No date selected">
				{(date) => (
					<div class="text-lg">
						{date().toDateString()}
						<div class="w-full flex flex-col items-center justify-center">
							<TextField>
								<TextFieldLabel for="email">Hours</TextFieldLabel>
								<TextFieldInput
									type="number"
									value={curHours()}
									onInput={(e) => {
										setCurHours(e.target.value);
									}}
								/>
							</TextField>
							<Button
								type="button"
								onClick={() => {
									if (props.selectedDate) {
										changeHours.mutate({
											date: props.selectedDate,
											hours: Number(curHours()),
											projectName: props.projectName,
										});
									}
								}}
							>
								Change hours
							</Button>
						</div>
					</div>
				)}
			</Show>
		</div>
	);
};

export default DayEditor;
