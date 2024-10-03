import { Suspense, type Component } from "solid-js";
import { trpc } from "~/utils/trpc";

const test: Component = (props) => {
	const test = trpc.test.createQuery();
	return (
		<div>
			<Suspense>{test.data?.message}</Suspense>
		</div>
	);
};

export default test;
