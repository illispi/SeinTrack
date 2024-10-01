import { A } from "@solidjs/router";
import Counter from "~/components/Counter";
import { trpc } from "~/utils/trpc";

export default function Home() {
	const test = trpc.test.createQuery();

	console.log(process.env.SITE, import.meta.env.VITE_SITE);
	return (
		<main class="text-center mx-auto text-gray-700 p-4">
			<Counter />
			<div>{test.data?.message}</div>
		</main>
	);
}
