import { type Component, createSignal, Show } from "solid-js";
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

import {
	Combobox,
	ComboboxContent,
	ComboboxControl,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxItemLabel,
	ComboboxSection,
	ComboboxTrigger,
} from "./ui/combobox";
import { trpc } from "~/utils/trpc";
import { Switch } from "~/server/trpc/routers/todoRoutes";
import type { IAppRouter } from "~/server/trpc/routers/mainRouter";
import type { inferRouterOutputs } from "@trpc/server";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";

type RouterOutput = inferRouterOutputs<IAppRouter>;

const massageTagsAndGroupsToArr = (
	data: RouterOutput["getTagsOrGroupsActiveOrNot"],
): string[] => {
	const arr = [];
	if (data) {
		for (const el of data) {
			if ("tag" in el) {
				if (el.tag) {
					arr.push(el.tag);
				}
			} else {
				arr.push(el.tagGroup);
			}
		}
	}

	return arr;
};

const TodoPanel: Component<{ curProjectId: number }> = (props) => {
	const [selectedTag, setSelectedTag] = createSignal("none");
	const [selectedTagGroup, setSelectedTagGroup] = createSignal("feature");

	const [newTag, setNewTag] = createSignal("");
	const [newTagGroup, setNewTagGroup] = createSignal("");

	const unDoneTodos = trpc.getUnDoneTodos.createQuery(() => ({
		projectId: props.curProjectId,
	}));
	const tagsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: props.curProjectId,
		switch: "tag",
	}));
	const tagGroupsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: props.curProjectId,
		switch: "tagGroup",
	}));

	const addTag = trpc.addTagOrGroup.createMutation(() => ({
		onSuccess: () => {
			setNewTag("");
			setNewTagGroup("");
		},
	}));
	const addTagGroup = trpc.addTagOrGroup.createMutation(() => ({
		onSuccess: () => {
			setNewTag("");
			setNewTagGroup("");
		},
	}));
	return (
		<>
			<div class="m-4 hidden w-11/12 max-w-96 grow flex-col items-center rounded-xl border-t-4 border-green-500 shadow-lg xl:flex">
				<h2 class="m-6 text-xl underline underline-offset-2">Todos</h2>
				<div class="flex w-full items-center justify-between gap-12 px-8">
					<Dialog>
						<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
							<Button class="w-full" variant={"secondary"}>
								Add Todo
							</Button>
						</DialogTrigger>
						<DialogContent class="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Add todo</DialogTitle>
							</DialogHeader>
							<Show when={unDoneTodos.data} fallback="doesnt work">
								You have no todos to be done.
							</Show>
							<Show when={tagsActive.data} fallback="No tags found">
								{(tags) => (
									<>
										<Select
											class="flex lg:hidden"
											defaultValue={"none"}
											value={selectedTag()}
											onChange={() => setSelectedTag}
											options={["none", ...massageTagsAndGroupsToArr(tags())]}
											placeholder="Select a tag"
											itemComponent={(props) => (
												<SelectItem item={props.item}>
													{props.item.rawValue}
												</SelectItem>
											)}
										>
											<SelectTrigger aria-label="Tag" class="w-[180px]">
												<SelectValue<string>>
													{(state) => state.selectedOption()}
												</SelectValue>
											</SelectTrigger>
											<SelectContent />
										</Select>
										<Combobox
											class="hidden lg:flex"
											options={massageTagsAndGroupsToArr(tags())}
											// optionValue="value"
											// optionTextValue="label"
											// optionLabel="label"
											// optionDisabled="disabled"
											// optionGroupChildren="options"
											placeholder="Select tag"
											itemComponent={(props) => (
												<ComboboxItem item={props.item}>
													<ComboboxItemLabel>
														{props.item.rawValue}
													</ComboboxItemLabel>
													<ComboboxItemIndicator />
												</ComboboxItem>
											)}
											sectionComponent={(props) => (
												<ComboboxSection>
													{props.section.rawValue}
												</ComboboxSection>
											)}
										>
											<ComboboxControl aria-label="Tag">
												<ComboboxInput />
												<ComboboxTrigger />
											</ComboboxControl>
											<ComboboxContent />
										</Combobox>
									</>
								)}
							</Show>
							<Show when={tagGroupsActive.data} fallback="No tag groups found">
								{(tagGroups) => (
									<Combobox
										options={massageTagsAndGroupsToArr(tagGroups())}
										// optionValue="value"
										// optionTextValue="label"
										// optionLabel="label"
										// optionDisabled="disabled"
										// optionGroupChildren="options"
										placeholder="Select tag group"
										itemComponent={(props) => (
											<ComboboxItem item={props.item}>
												<ComboboxItemLabel>
													{props.item.rawValue}
												</ComboboxItemLabel>
												<ComboboxItemIndicator />
											</ComboboxItem>
										)}
										sectionComponent={(props) => (
											<ComboboxSection>
												{props.section.rawValue}
											</ComboboxSection>
										)}
									>
										<ComboboxControl aria-label="Tag group">
											<ComboboxInput />
											<ComboboxTrigger />
										</ComboboxControl>
										<ComboboxContent />
									</Combobox>
								)}
							</Show>

							<DialogFooter>
								<Button type="submit">Save changes</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog>
						<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
							<Button class="w-full" variant={"secondary"}>
								Add Tag
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Tag/Group</DialogTitle>
							</DialogHeader>
							<div class="flex items-center justify-start gap-4">
								<TextField class="grid w-full items-center gap-1.5">
									<TextFieldLabel for="tag">New Tag</TextFieldLabel>
									<div class="flex items-center justify-start gap-4">
										<TextFieldInput type="text" id="tag" placeholder="Tag" />
										<Button
											onClick={() =>
												addTag.mutate({
													nameOfTagOrGroup: newTag(),
													projectId: props.curProjectId,
													switch: "tag",
												})
											}
											class="flex-1"
											variant={"secondary"}
										>
											Add
										</Button>
									</div>
								</TextField>
							</div>
							<div class="flex items-center justify-start gap-4">
								<TextField class="grid w-full items-center gap-1.5">
									<TextFieldLabel for="tag">New Tag Group</TextFieldLabel>
									<div class="flex items-center justify-start gap-4">
										<TextFieldInput
											type="text"
											id="tagGroup"
											placeholder="Tag Group"
										/>
										<Button
											onClick={() =>
												addTagGroup.mutate({
													nameOfTagOrGroup: newTagGroup(),
													projectId: props.curProjectId,
													switch: "tagGroup",
												})
											}
											class="flex-1"
											variant={"secondary"}
										>
											Add
										</Button>
									</div>
								</TextField>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			<div class="flex lg:hidden"></div>
		</>
	);
};

export default TodoPanel;

//   interface Food {
//     value: string
//     label: string
//     disabled: boolean
//   }
//   interface Category {
//     label: string
//     options: Food[]
//   }
//   const ALL_OPTIONS: Category[] = [
//     {
//       label: "Fruits",
//       options: [
//         { value: "apple", label: "Apple", disabled: false },
//         { value: "banana", label: "Banana", disabled: false },
//         { value: "blueberry", label: "Blueberry", disabled: false },
//         { value: "grapes", label: "Grapes", disabled: true },
//         { value: "pineapple", label: "Pineapple", disabled: false }
//       ]
//     },
//     {
//       label: "Meat",
//       options: [
//         { value: "beef", label: "Beef", disabled: false },
//         { value: "chicken", label: "Chicken", disabled: false },
//         { value: "lamb", label: "Lamb", disabled: false },
//         { value: "pork", label: "Pork", disabled: false }
//       ]
//     }
//   ]
