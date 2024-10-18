// utils/trpc.ts
import { MutationCache, QueryClient } from "@tanstack/solid-query";

import { createTRPCSolidStart } from "@solid-mediakit/trpc";
import { httpBatchLink } from "@trpc/client";
import { getRequestEvent, isServer } from "solid-js/web";
import superjson from "superjson";
import type { IAppRouter } from "~/server/trpc/routers/mainRouter";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return "";

	return `${
		!import.meta.env.VITE_SITE ? process.env.SITE_URL : "http://localhost:3000"
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
	mutationCache: new MutationCache({
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	}),
});
