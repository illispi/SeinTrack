import { type Component, Show } from "solid-js";
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

const TodoPanel: Component = () => {
	const utils = trpc.useContext();
	const allProjects = trpc.allProjects.createQuery();

	//TODO remove
	const temp = allProjects.data ? allProjects.data[0] : null;
	// const temp = { id: 1 };
	const unDoneTodos = trpc.getUnDoneTodos.createQuery(() => ({
		projectId: temp?.id,
	}));
	const tagsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: temp?.id,
		switch: 1,
	}));
	const tagGroupsActive = trpc.getTagsOrGroupsActiveOrNot.createQuery(() => ({
		active: true,
		projectId: temp?.id,
		switch: 0,
	}));
	return (
		<>
			<div class="hidden h-full min-h-screen grow xl:flex">
				<Dialog>
					<DialogTrigger as={Button<"button">}>Add todo</DialogTrigger>
					<DialogContent class="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add todo</DialogTitle>
							<DialogDescription>
								Make changes to your profile here. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<Show when={unDoneTodos.data} fallback="doesnt work">
							Works
						</Show>
						<Show when={tagsActive.data} fallback="No tags found">
							{(tags) => (
								<Combobox
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
												{props.item.rawValue.label}
											</ComboboxItemLabel>
											<ComboboxItemIndicator />
										</ComboboxItem>
									)}
									sectionComponent={(props) => (
										<ComboboxSection>
											{props.section.rawValue.label}
										</ComboboxSection>
									)}
								>
									<ComboboxControl aria-label="Tag">
										<ComboboxInput />
										<ComboboxTrigger />
									</ComboboxControl>
									<ComboboxContent />
								</Combobox>
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
												{props.item.rawValue.label}
											</ComboboxItemLabel>
											<ComboboxItemIndicator />
										</ComboboxItem>
									)}
									sectionComponent={(props) => (
										<ComboboxSection>
											{props.section.rawValue.label}
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
