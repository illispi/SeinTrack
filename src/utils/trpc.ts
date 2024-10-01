// utils/trpc.ts
import { QueryClient } from "@tanstack/solid-query";

import { httpBatchLink } from "@trpc/client";
import { getRequestEvent, isServer } from "solid-js/web";
import { createTRPCSolidStart } from "@solid-mediakit/trpc";
import type { IAppRouter } from "~/server/trpc/mainRouter";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return "";

	console.log(process.env.SITE, import.meta.env.VITE_SITE);

	return `${process.env.SITE ? process.env.SITE : import.meta.env.VITE_SITE}`;
};

export const trpc = createTRPCSolidStart<IAppRouter>({
	config() {
		// PageEvent of Solid-start
		return {
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
		},
	},
});
