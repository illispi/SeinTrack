import { createSignal, Show, type Component } from "solid-js";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Button } from "./ui/button";
import { trpc } from "~/utils/trpc";
import {
	NumberField,
	NumberFieldDecrementTrigger,
	NumberFieldErrorMessage,
	NumberFieldGroup,
	NumberFieldIncrementTrigger,
	NumberFieldInput,
} from "./ui/number-field";

const DayEditor: Component<{
	selectedDate: Date | null;
	projectName: string;
}> = (props) => {
	const [addHours, setAddHours] = createSignal(0);
	const [addMinutes, setAddMinutes] = createSignal(0);

	const utils = trpc.useContext();
	const changeHours = trpc.changeDayHours.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
			setAddHours(0);
		},
	}));
	return (
		<div>
			<Show when={props.selectedDate} fallback="No date selected">
				{(date) => (
					<div class="flex flex-col gap-4 text-lg">
						{date().toDateString()}
						<div class="w-full flex flex-col items-center justify-center gap-4">
							<div class="grid w-full grid-cols-2 gap-2">
								<h3>Hours:</h3>
								<h3>Minutes:</h3>
								<NumberField
									class="flex w-36 flex-col gap-2"
									onRawValueChange={setAddHours}
									validationState={
										addHours() + addMinutes() / 60 > 24 ? "invalid" : "valid"
									}
								>
									<NumberFieldGroup>
										<NumberFieldInput />
										<NumberFieldIncrementTrigger />
										<NumberFieldDecrementTrigger />
									</NumberFieldGroup>
									<NumberFieldErrorMessage>
										Exceeds 24 hours
									</NumberFieldErrorMessage>
								</NumberField>
								<NumberField
									class="flex w-36 flex-col gap-2"
									onRawValueChange={setAddMinutes}
									validationState={
										addHours() + addMinutes() / 60 > 24 ? "invalid" : "valid"
									}
								>
									<NumberFieldGroup>
										<NumberFieldInput />
										<NumberFieldIncrementTrigger />
										<NumberFieldDecrementTrigger />
									</NumberFieldGroup>
									<NumberFieldErrorMessage>
										Exceeds 24 hours
									</NumberFieldErrorMessage>
								</NumberField>
							</div>

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
							<Show when={changeHours.isError}>
								{changeHours.error?.message}
							</Show>
						</div>
					</div>
				)}
			</Show>
		</div>
	);
};

export default DayEditor;
