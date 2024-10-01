import { A } from "@solidjs/router";
import { Suspense } from "solid-js";
import Counter from "~/components/Counter";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const test = trpc.test.createQuery();

	return (
		<main class="text-center mx-auto text-gray-700 p-4">
			<Suspense>
				<div>{test.data?.message}</div>
			</Suspense>
		</main>
	);
}
