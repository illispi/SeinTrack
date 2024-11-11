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
		<main class="flex min-h-screen w-full items-center justify-center">
			<div class="m-auto flex w-11/12 max-w-screen-md flex-col items-center justify-center gap-4 rounded-xl border border-t-4 border-gray-200 border-t-green-500 bg-white p-8 shadow-md">
				<h3 class="text-2xl font-semibold">Info</h3>
				<p class="text-base">
					This web app is a hybrid of seinfeld calendar and a time tracking app.
					Set target hours, how much you would like to work on your project a
					day and start your streak. It is intended to be self-hosted behind
					your auth like Authelia or Cloudflare access. This is demo version,
					and database will be cleared once a week after solid hack 2024. If
					cookie doesn't exist, It creates user and you can just start using it
					without registration. For more info see:
					<a class="text-blue-600" href="https://github.com/illispi/SeinTrack">
						https://github.com/illispi/SeinTrack
					</a>
				</p>
				<h3 class="mt-12 text-2xl font-semibold">Create new project</h3>
				<TextField class="flex flex-col gap-4">
					<TextFieldLabel class="text-left">Project name</TextFieldLabel>
					<TextFieldInput
						type="text"
						onInput={(e) => {
							setName(e.target.value);
						}}
					/>
				</TextField>
				<TextField class="flex flex-col gap-4">
					<TextFieldLabel class="text-left">
						Target hours (a day)
					</TextFieldLabel>
					<TextFieldInput
						type="number"
						onInput={(e) => {
							setHours(e.target.value);
						}}
					/>
				</TextField>
				<Button
					variant={"secondary"}
					onClick={() =>
						projectsMut.mutate({ hoursTarget: Number(hours()), name: name() })
					}
					type="submit"
					class="w-48"
				>
					Save changes
				</Button>
			</div>
		</main>
	);
};

export default NewProject;
