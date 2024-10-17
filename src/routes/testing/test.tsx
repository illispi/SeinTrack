import { A } from "@solidjs/router";
import { type Component, ErrorBoundary, For, Show, Suspense } from "solid-js";
import { dayAdjust } from "~/components/ListMonth";
import { trpc } from "~/utils/trpc";

const test: Component = (props) => {
	const test = trpc.test.createQuery();
	return (
		<div>
			<A href="/">ROOT</A>
			<ErrorBoundary fallback="error">
				<Suspense>
					<Show when={test.data}>{(t) => <div>{t()}</div>}</Show>
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default test;

// const testi = async () => {
// 	const test = await client.test.query();
// 	return test;
// };
// const test: Component = (props) => {
// 	return (
// 		<div>
// 			<A href="/">ROOT</A>
// 			<Suspense>
// 				<Show when={testi()}>{(t) => <div>{t()}</div>}</Show>
// 			</Suspense>
// 		</div>
// 	);
// };

// export default test;
