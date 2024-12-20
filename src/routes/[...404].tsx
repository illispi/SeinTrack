import { A } from "@solidjs/router";

export default function NotFound() {
	return (
		<main class="mx-auto p-4 text-center text-gray-700">
			<h1 class=" my-16 text-6xl font-thin uppercase text-sky-700">
				Not Found
			</h1>
			<button
				type="button"
				onClick={() => {
					throw new Error("Sentry Frontend Error");
				}}
			>
				Throw error
			</button>
			;
			<p class="mt-8">
				Visit{" "}
				<a
					href="https://solidjs.com"
					target="_blank"
					class="text-sky-600 hover:underline"
					rel="noreferrer"
				>
					solidjs.com
				</a>{" "}
				to learn how to build Solid apps.
			</p>
			<p class="my-4">
				<A href="/" class="text-sky-600 hover:underline">
					Home
				</A>
				{" - "}
				<A href="/about" class="text-sky-600 hover:underline">
					About Page
				</A>
			</p>
		</main>
	);
}
