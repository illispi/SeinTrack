import { A } from "@solidjs/router";
import {
	type Component,
	For,
	type Setter,
	Show,
	Suspense,
	createSignal,
} from "solid-js";
import { daysOfWeekJsDate } from "~/utils/functionsAndVariables";
import { trpc } from "~/utils/trpc";
import { Button } from "./ui/button";
import { Switch, SwitchControl, SwitchThumb } from "./ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import BackNav from "./BackNav";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import clsx from "clsx";

const Menu: Component<{
	selectedProjectId: number;
	setSelectedProjectId: Setter<number>;
}> = (props) => {
	const [tagsOpen, setTagsOpen] = createSignal(false);
	const [name, setName] = createSignal("");
	const [hours, setHours] = createSignal("");
	const [showHidden, setShowHidden] = createSignal(false);

	const [openEditProjects, setOpenEditProjects] = createSignal(false);

	const projects = trpc.allProjects.createQuery();
	const activeDays = trpc.getActiveDays.createQuery(
		() => props.selectedProjectId,
	);
	const targetHours = trpc.getTargetHours.createQuery(
		() => props.selectedProjectId,
	);
	const editTargetHours = trpc.editTargetHours.createMutation();

	const editActiveDays = trpc.editActiveDays.createMutation();

	const allTags = trpc.getAllTags.createQuery(() => ({
		projectId: props.selectedProjectId,
	}));
	const allTagGroups = trpc.getAllTagGroups.createQuery(() => ({
		projectId: props.selectedProjectId,
	}));

	const toggleTag = trpc.toggleTagActive.createMutation();
	const toggleTagGroup = trpc.toggleTagGroupActive.createMutation();
	const allProjects = trpc.allProjects.createQuery();
	const editProjects = trpc.editProject.createMutation();
	const newProject = trpc.newProject.createMutation();
	return (
		<>
			<h2 class="m-8 text-4xl font-light">Menu</h2>
			<div class="flex w-11/12 items-center justify-center gap-12">
				<Button class="w-full flex-1" variant={"secondary"}>
					<A href="stastics">Statistics</A>
				</Button>
				<BackNav setOpen={setOpenEditProjects} open={openEditProjects()}>
					<Sheet onOpenChange={setOpenEditProjects} open={openEditProjects()}>
						<SheetTrigger
							class="w-full flex-1"
							as={Button<"button">}
							variant={"secondary"}
						>
							Edit Projects
						</SheetTrigger>
						<SheetContent class="w-full max-w-96 p-0">
							<div class="flex min-h-screen grow flex-col items-center gap-6 border border-t-4 border-gray-200 border-t-green-500 bg-white py-8 shadow-md">
								<h3 class="text-xl">Edit Projects</h3>
								<div class="flex w-11/12 flex-col items-center justify-start gap-6 rounded-lg border px-4 py-8 shadow-md">
									<h3 class="text-xl">Create New Project</h3>
									<TextField class="grid w-full grid-cols-4 items-center gap-4">
										<TextFieldLabel class="text-right">
											Project Name
										</TextFieldLabel>
										<TextFieldInput
											class="col-span-3"
											type="text"
											onInput={(e) => {
												setName(e.currentTarget.value);
											}}
										/>
									</TextField>
									<TextField class="grid w-full grid-cols-4 items-center gap-4">
										<TextFieldLabel class="text-right">Hours</TextFieldLabel>
										<TextFieldInput
											class="col-span-3"
											type="number"
											onInput={(e) => {
												setHours(e.currentTarget.value);
											}}
										/>
									</TextField>
									<Button
										onClick={() =>
											newProject.mutate({
												hoursTarget: Number(hours()),
												name: name(),
											})
										}
										type="submit"
										variant={"secondary"}
									>
										Create New
									</Button>
								</div>
								<h3 class="text-xl">Activate project</h3>
								<For each={allProjects.data}>
									{(project) => (
										<div class="flex w-11/12 items-center justify-between">
											<p>{project.name}</p>
											<Switch
												checked={project.active}
												onChange={(e) => {
													editProjects.mutate({
														active: e,
														hoursTarget: project.targetHours,
														name: project.name,
														projectId: project.id,
													});
												}}
											>
												<SwitchControl>
													<SwitchThumb />
												</SwitchControl>
											</Switch>
										</div>
									)}
								</For>
							</div>
						</SheetContent>
					</Sheet>
				</BackNav>
			</div>
			<div class="flex w-11/12 flex-col gap-8">
				<h3 class="mt-12 text-xl">Select project</h3>
				<Suspense>
					<div class="flex flex-col items-center justify-start gap-4">
						<For each={projects.data}>
							{(project) => (
								<Show when={project.active}>
									<div class="w-11/12">
										<button
											onClick={() => {
												props.setSelectedProjectId(project.id);
											}}
											type="button"
											class={clsx(
												props.selectedProjectId !== project.id ||
													"text-2xl font-semibold underline underline-offset-4",
												"text-left hover:scale-105",
											)}
										>
											{project.name}
										</button>
									</div>
								</Show>
							)}
						</For>
					</div>
				</Suspense>
				<h3 class="text-xl">Hour target</h3>
				<div class="flex w-full items-center justify-center">
					<div class="grid w-11/12 grid-cols-4 gap-4">
						<Button
							variant={"outline"}
							onClick={() => {
								editTargetHours.mutate({
									projectId: props.selectedProjectId,
									targetHours: targetHours.data?.targetHours - 1,
								});
							}}
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
						<div class="col-span-2 flex items-center justify-center">
							<h4 class="text-center text-lg font-semibold">{`${Math.floor(targetHours.data?.targetHours)}h ${(targetHours.data?.targetHours % 1).toFixed(2) * 60}min`}</h4>
						</div>
						<Button
							variant={"outline"}
							onClick={() => {
								editTargetHours.mutate({
									projectId: props.selectedProjectId,
									targetHours: targetHours.data?.targetHours + 1,
								});
							}}
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
						<For each={new Array(4)}>
							{(_, i) => (
								<Button
									variant={"outline"}
									onClick={() => {
										editTargetHours.mutate({
											projectId: props.selectedProjectId,
											targetHours:
												Math.floor(targetHours.data?.targetHours) +
												(i() * 15) / 60,
										});
									}}
								>{`${i() * 15}min`}</Button>
							)}
						</For>
					</div>
				</div>
				<h3 class="text-xl">Toggle active days</h3>
				<div class="flex flex-col items-center justify-center gap-4">
					<For each={daysOfWeekJsDate}>
						{(day, i) => (
							<div class="flex w-11/12 items-center justify-between">
								<p class=" w-fit text-left ">
									{daysOfWeekJsDate[i() !== 6 ? i() + 1 : 0]}
								</p>

								<Switch
									checked={Number.isInteger(
										activeDays.data?.find(
											(e) => e.day === (i() !== 6 ? i() + 1 : 0),
										)?.day,
									)}
									onChange={(e) => {
										if (e === true) {
											const newDates = activeDays.data?.map((e) => e.day);
											newDates?.push(i() !== 6 ? i() + 1 : 0);
											editActiveDays.mutate({
												activeDays: newDates!,
												projectId: props.selectedProjectId,
											});
										} else {
											const filterDates = activeDays.data?.filter(
												(e) => e.day !== (i() !== 6 ? i() + 1 : 0),
											);
											const newDates = filterDates?.map((e) => e.day);
											editActiveDays.mutate({
												activeDays: newDates!,
												projectId: props.selectedProjectId,
											});
										}
									}}
								>
									<SwitchControl>
										<SwitchThumb />
									</SwitchControl>
								</Switch>
							</div>
						)}
					</For>
				</div>
				<Button
					onClick={() => {
						setShowHidden(!showHidden());
					}}
					variant={"outline"}
				>
					{`${showHidden() ? "Hide deactivated" : "Show deactivated"}`}
				</Button>
				<div class={"flex flex-col items-center justify-center gap-4"}>
					<h3 class="mb-4 w-full text-left text-xl">Tags</h3>
					<For each={allTags.data}>
						{(tag) => (
							<>
								<Show when={tag.tagActive || showHidden()}>
									<div class="flex w-11/12 items-center justify-between">
										<p class=" w-fit text-left ">{tag.tag}</p>
										<Switch
											checked={tag.tagActive}
											onChange={(e) => {
												toggleTag.mutate({ setActive: e, tagId: tag.id });
											}}
										>
											<SwitchControl>
												<SwitchThumb />
											</SwitchControl>
										</Switch>
									</div>
								</Show>
							</>
						)}
					</For>
				</div>
				<div class={"mb-12 flex flex-col items-center justify-center gap-4"}>
					<h3 class="mb-4 w-full text-left text-xl">Tag Groups</h3>
					<For each={allTagGroups.data}>
						{(tagGroup) => (
							<>
								<Show when={tagGroup.tagGroupActive || showHidden()}>
									<div class="flex w-11/12 items-center justify-between">
										<p class=" w-fit text-left ">{tagGroup.tagGroup}</p>
										<Switch
											checked={tagGroup.tagGroupActive}
											onChange={(e) => {
												toggleTagGroup.mutate({
													setActive: e,
													tagGroupId: tagGroup.id,
												});
											}}
										>
											<SwitchControl>
												<SwitchThumb />
											</SwitchControl>
										</Switch>
									</div>
								</Show>
							</>
						)}
					</For>
				</div>
			</div>
		</>
	);
};

export default Menu;
