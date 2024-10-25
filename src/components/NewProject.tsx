import { type Component, createSignal } from "solid-js";
import { trpc } from "~/utils/trpc";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

const NewProject: Component = (props) => {
	const projectsMut = trpc.newProject.createMutation(() => ({}));

	const [hours, setHours] = createSignal(3);
	const [name, setName] = createSignal("");
	return (
		<Dialog>
			<DialogTrigger as={Button<"button">}>Edit Profile</DialogTrigger>
			<DialogContent class="  sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create project</DialogTitle>
					<DialogDescription>Create new project</DialogDescription>
				</DialogHeader>
				<div class="grid gap-4 py-4">
					<TextField class="grid grid-cols-4 items-center gap-4">
						<TextFieldLabel class="text-right">Name</TextFieldLabel>
						<TextFieldInput
							class="col-span-3"
							type="text"
							onInput={(e) => {
								setName(e.target.value);
							}}
						/>
					</TextField>
					<TextField class="grid grid-cols-4 items-center gap-4">
						<TextFieldLabel class="text-right">Hours</TextFieldLabel>
						<TextFieldInput
							class="col-span-3"
							type="number"
							onInput={(e) => {
								setHours(e.target.value);
							}}
						/>
					</TextField>
				</div>
				<DialogFooter>
					<Button
						onClick={() =>
							projectsMut.mutate({ hoursTarget: Number(hours()), name: name() })
						}
						type="submit"
					>
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default NewProject;
