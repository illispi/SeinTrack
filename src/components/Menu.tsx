import { For, Suspense, type Component } from "solid-js";
import { Button } from "./ui/button";
import { A } from "@solidjs/router";
import { trpc } from "~/utils/trpc";

const Menu: Component = (props) => {
	const projects = trpc.allProjects.createQuery();
	return (
		<>
			<h2 class="m-8 text-4xl font-light">Menu</h2>
			<div class="flex w-11/12 items-center justify-center gap-12">
				<Button class="w-full flex-1" variant={"secondary"}>
					<A href="stastics">Statistics</A>
				</Button>
				<Button class="w-full flex-1" variant={"secondary"}>
					New project
				</Button>
			</div>
			<div class="flex w-11/12 flex-col gap-8">
				<h3 class="mt-12 text-xl">Select project:</h3>
				<Suspense>
					<div class="flex flex-col gap-4">
						<For each={projects.data}>
							{(project) => (
								<button
									type="button"
									class="ml-8 w-fit text-left hover:scale-105"
								>
									{project.name}
								</button>
							)}
						</For>
					</div>
				</Suspense>
				<h3 class="text-xl">Hour target:</h3>
			</div>
		</>
	);
};

export default Menu;
