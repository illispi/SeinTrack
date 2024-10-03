import { A } from "@solidjs/router";
import { For, Show, Suspense, type Component } from "solid-js";
import { dayAdjust } from "~/components/ListMonth";
import { trpc } from "~/utils/trpc";

const test: Component = (props) => {
	const test = trpc.test.createQuery();

	return (
		<div>
			<A href="/">ROOT</A>
			{/* <Suspense>
				<Show when={hours.data}>
					<For each={hours.data}>{(dat) => dat.date}</For>
				</Show>
			</Suspense> */}
		</div>
	);
};

export default test;
