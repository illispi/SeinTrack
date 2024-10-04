// utils/trpc.ts
import { QueryClient } from "@tanstack/solid-query";

import { httpBatchLink } from "@trpc/client";
import { getRequestEvent, isServer } from "solid-js/web";
import { createTRPCSolidStart } from "@solid-mediakit/trpc";
import type { IAppRouter } from "~/server/trpc/mainRouter";
import superjson from "superjson";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return "";

	return `${
		!import.meta.env.VITE_SITE ? process.env.SITE_URL : "localhost:3000"
	}`;
};

export const trpc = createTRPCSolidStart<IAppRouter>({
	config() {
		// PageEvent of Solid-start
		return {
			transformer: superjson,
			links: [
				httpBatchLink({
					url: `${getBaseUrl()}/api/trpc`,
					headers: () => {
						const event = isServer ? getRequestEvent() : null;
						const r = event
							? {
									...Object.fromEntries(event?.request.headers),
								}
							: "";
						return r;
					},
				}),
			],
		};
	},
});

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			suspense: true,
			experimental_prefetchInRender: true,
		},
	},
});
