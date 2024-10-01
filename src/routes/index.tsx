import { Suspense } from "solid-js";
import ListMonth from "~/components/ListMonth";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const test = trpc.test.createQuery();

	return (
		<main class="text-center mx-auto text-gray-700 p-4">
			<Suspense>
				<div>{test.data?.message}</div>
				<ListMonth month={4} year={2024} />
			</Suspense>
		</main>
	);
}
