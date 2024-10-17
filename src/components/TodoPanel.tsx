import type { Component } from "solid-js";
import {
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	Dialog,
} from "./ui/dialog";
import { TextFieldLabel, TextFieldInput, TextField } from "./ui/text-field";
import { Button } from "./ui/button";

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

const TodoPanel: Component = (props) => {
	return (
		<>
			<div class="hidden h-full min-h-screen grow xl:flex" />
			<div class="flex lg:hidden">
				<Dialog>
					<DialogTrigger as={Button<"button">}>Add todo</DialogTrigger>
					<DialogContent class="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add todo</DialogTitle>
							<DialogDescription>
								Make changes to your profile here. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<Combobox
							options={ALL_OPTIONS}
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
							<ComboboxControl aria-label="Food">
								<ComboboxInput />
								<ComboboxTrigger />
							</ComboboxControl>
							<ComboboxContent />
						</Combobox>
						<DialogFooter>
							<Button type="submit">Save changes</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
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
