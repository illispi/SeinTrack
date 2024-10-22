import { For, type Setter, Show, type Component } from "solid-js";
import { completeTodo } from "~/server/trpc/routers/todoRoutes";
import AddTime from "./AddTime";
import {
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	Dialog,
} from "./ui/dialog";
import {
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectContent,
	Select,
} from "./ui/select";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { Toaster } from "./ui/toast";
import { Button } from "./ui/button";
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

const UnDoneTodos: Component<{
	openSecond: boolean;
	setOpenSecond: Setter<boolean>;
	setSelectedTag: Setter<string>;
	todoOrTag: "todo" | "tag" | null;
	setTodoOrTag: Setter<"todo" | "tag" | null>;
	newTodo: string;
	setNewTodo: Setter<string>;
	tagsActive: RouterOutput["getTagsOrGroupsActiveOrNot"];
	tagGroupsActive: RouterOutput["getTagsOrGroupsActiveOrNot"];
	selectedTag: string;
	selectedTagGroup: string;
	addTodoOnClick: (e: any) => void;
	addTagOnClick: () => void;
	addTagGroupOnClick: () => void;
	newTag: string;
	setNewTag: Setter<string>;
	newTagGroup: string;
	setNewTagGroup: Setter<string>;
	unDoneTodos: RouterOutput["getUnDoneTodos"];
	addHours: number;
	addMinutes: number;
	setAddHours: Setter<number>;
	setAddMinutes: Setter<number>;
	setDatepicker: Setter<HTMLDivElement | undefined>;
	datePickerInstance: any;
	completeTodoOnClick: (e: RouterOutput["getUnDoneTodos"]) => undefined;
	setSelectedTagGroup: Setter<string>;
}> = (props) => {
	return (
		<>
			<h2 class="m-8 text-4xl font-light">Todos</h2>
			<div class="mb-4 flex w-11/12 items-center justify-between gap-12">
				<Dialog
					open={props.openSecond && props.todoOrTag === "todo"}
					onOpenChange={() => {
						props.setTodoOrTag("todo");
						props.setOpenSecond(!props.openSecond);
					}}
				>
					<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
						<Button class="w-full" variant={"secondary"}>
							Add Todo
						</Button>
					</DialogTrigger>
					<DialogContent class="  sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>Add todo</DialogTitle>
						</DialogHeader>
						<div class="flex items-center justify-start gap-4">
							<TextField
								value={props.newTodo}
								onChange={props.setNewTodo}
								class="grid w-full items-center gap-1.5"
							>
								<div class="flex items-center justify-start gap-4">
									<TextFieldInput
										type="text"
										id="newTodo"
										placeholder="New todo"
									/>
								</div>
							</TextField>
						</div>
						<div class="grid grid-cols-2">
							<h3 class="font-semibold">Tag:</h3>
							<h3 class="font-semibold">Tag group:</h3>
							<Show when={props.tagsActive} fallback="No tags found">
								{(tags) => (
									<>
										<Select
											class="flex"
											//NOTE issue on shadnc solid-ui?
											defaultValue={"none"}
											value={props.selectedTag}
											onChange={props.setSelectedTag}
											options={["none", ...massageTagsAndGroupsToArr(tags())]}
											placeholder="Select a tag"
											itemComponent={(props) => (
												<SelectItem item={props.item}>
													{props.item.rawValue}
												</SelectItem>
											)}
										>
											<SelectTrigger aria-label="Tag">
												<SelectValue<string>>
													{(state) => state.selectedOption()}
												</SelectValue>
											</SelectTrigger>
											<SelectContent />
										</Select>
									</>
								)}
							</Show>
							<Show when={props.tagGroupsActive} fallback="No tag groups found">
								{(tagGroups) => (
									<>
										<Select
											class="flex"
											value={props.selectedTagGroup}
											onChange={props.setSelectedTagGroup}
											options={[...massageTagsAndGroupsToArr(tagGroups())]}
											placeholder="Select a tag"
											itemComponent={(props) => (
												<SelectItem item={props.item}>
													{props.item.rawValue}
												</SelectItem>
											)}
										>
											<SelectTrigger aria-label="Tag">
												<SelectValue<string>>
													{(state) => state.selectedOption()}
												</SelectValue>
											</SelectTrigger>
											<SelectContent />
										</Select>
									</>
								)}
							</Show>
						</div>

						<DialogFooter>
							<Button
								onClick={props.addTodoOnClick}
								class="w-full p-0"
								variant={"secondary"}
								type="submit"
							>
								Add Todo
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog
					open={props.openSecond && props.todoOrTag === "tag"}
					onOpenChange={() => {
						props.setTodoOrTag("tag");
						props.setOpenSecond(!props.openSecond);
					}}
				>
					<DialogTrigger class="flex-1 p-0" as={Button<"button">}>
						<Button class="w-full" variant={"secondary"}>
							Add Tag
						</Button>
					</DialogTrigger>
					<DialogContent class=" ">
						<DialogHeader>
							<DialogTitle>Add Tag/Group</DialogTitle>
						</DialogHeader>
						<div class="flex items-center justify-start gap-4">
							<TextField
								value={props.newTag}
								onChange={props.setNewTag}
								class="grid w-full items-center gap-1.5"
							>
								<TextFieldLabel for="tag">New Tag</TextFieldLabel>
								<div class="flex items-center justify-start gap-4">
									<TextFieldInput type="text" id="tag" placeholder="Tag" />
									<Button
										onClick={props.addTagOnClick}
										class="flex-1"
										variant={"secondary"}
									>
										Add
									</Button>
								</div>
							</TextField>
						</div>
						<div class="flex items-center justify-start gap-4">
							<TextField
								value={props.newTagGroup}
								onChange={props.setNewTagGroup}
								class="grid w-full items-center gap-1.5"
							>
								<TextFieldLabel for="tag">New Tag Group</TextFieldLabel>
								<div class="flex items-center justify-start gap-4">
									<TextFieldInput
										type="text"
										id="tagGroup"
										placeholder="Tag Group"
									/>
									<Button
										onClick={props.addTagGroupOnClick}
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
				<Toaster />
			</div>

			<For each={props.unDoneTodos}>
				{(unDoneTodo) => (
					<div class="my-4 flex h-32 w-11/12 items-start justify-between rounded-lg border border-t-2 border-gray-200 p-4 shadow-md">
						<div class="flex h-full flex-col items-start justify-between">
							<p class="text-wrap break-words text-sm lg:text-base">
								{unDoneTodo.todo}
							</p>
							<p class="text-sm italic">{`tag: ${unDoneTodo.tag ? unDoneTodo.tag : "none"} || group: ${unDoneTodo.tagGroup}`}</p>
						</div>
						<div class="flex flex-col items-center justify-center gap-4">
							<Dialog>
								<DialogTrigger>
									<Button variant="secondary" class="w-16">
										Done
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle class="text-center">
											Complete Todo:
										</DialogTitle>
									</DialogHeader>
									<div class="mx-auto flex w-full max-w-[310px] flex-col items-center justify-between gap-8">
										<p class="mt-4 w-full border-t border-t-green-500 pt-4">
											{unDoneTodo.todo}
										</p>
										<div class="w-full border-t border-t-green-500 pt-4 text-sm font-semibold">
											Hours spent:
										</div>
										<div>
											<AddTime
												hours={props.addHours}
												minutes={props.addMinutes}
												setHours={props.setAddHours}
												setMinutes={props.setAddMinutes}
											/>
										</div>
										<div class=" w-full border-t border-t-green-500 pt-4 text-sm font-semibold">
											Date completed:
										</div>
										<div class="flex h-80 w-full items-center justify-center">
											<input
												class="w-full"
												type="text"
												ref={props.setDatepicker}
											></input>
										</div>
										<Button
											onClick={props.completeTodoOnClick(unDoneTodo)}
											class="w-full max-w-64"
											variant={"secondary"}
										>
											Complete
										</Button>
									</div>
								</DialogContent>
							</Dialog>

							<Button variant="outline" class="w-16">
								Edit
							</Button>
						</div>
					</div>
				)}
			</For>
		</>
	);
};

export default UnDoneTodos;
