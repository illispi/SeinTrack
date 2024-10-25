import {
	createSignal,
	For,
	type Setter,
	Suspense,
	type Component,
} from "solid-js";
import { Button } from "./ui/button";
import { A } from "@solidjs/router";
import { trpc } from "~/utils/trpc";

const Menu: Component<{
	selectedProjectId: number;
	setSelectedProjectId: Setter<number>;
}> = (props) => {
	const [projectTarget, setProjectTarget] = createSignal(0);
	const projects = trpc.allProjects.createQuery();
	const activeDays = trpc.getActiveDays.createQuery(
		() => props.selectedProjectId,
	);
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
				<h3 class="mt-12 text-xl">Select project</h3>
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
				<h3 class="text-xl">Hour target</h3>
				<div class="flex w-full justify-center">
					<div class="grid w-4/5 grid-cols-3 gap-4">
						<Button
							class="w-full max-w-40"
							variant={"outline"}
							onClick={() =>
								projectTarget() > 0
									? setProjectTarget(projectTarget() - 1)
									: null
							}
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
						<div class=" flex items-center justify-center">
							{/* TODO take that text value from query from backend */}
							<h4 class="text-center text-lg font-semibold">{`${projectTarget()}h`}</h4>
						</div>
						<Button
							class="w-full max-w-40"
							variant={"outline"}
							onClick={() =>
								projectTarget() < 24
									? setProjectTarget(projectTarget() + 1)
									: null
							}
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
					</div>
				</div>
				<h3 class="text-xl">Toggle active days</h3>
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
			</div>
		</>
	);
};

export default Menu;
