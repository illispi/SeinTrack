import { For, Show, Suspense, type Component } from "solid-js";
import { dayAdjust } from "~/components/ListMonth";
import { trpc } from "~/utils/trpc";

const test: Component = (props) => {
	const test = trpc.test.createQuery();
	const hours = trpc.getHoursOfDay.createQuery(() => {
		return dayAdjust(9, 2024);
	});
	return (
		<div>
			<Suspense>
				<Show when={hours.data}>
					<For each={hours.data}>{(dat) => dat}</For>
				</Show>
			</Suspense>
		</div>
	);
};

export default test;
