// utils/trpc.ts
// tRPC v11 has no official Solid adapter, so this file builds a small typed
// wrapper on top of the vanilla tRPC client + @tanstack/solid-query.
// It keeps the same call-site API the app used with @solid-mediakit/trpc:
// (Solid 1 / @tanstack/solid-query v5: built on createQuery/createMutation/createInfiniteQuery)
//   trpc.someQuery.createQuery(() => input, () => options)
//   trpc.someMutation.createMutation(() => options)
//   trpc.someInfinite.createInfiniteQuery(() => input, () => options)
import {
	type CreateInfiniteQueryResult,
	type CreateMutationResult,
	type CreateQueryResult,
	createInfiniteQuery,
	createMutation,
	createQuery,
	type InfiniteData,
	keepPreviousData,
	MutationCache,
	type MutationObserverOptions,
	QueryClient,
	type QueryKey,
	type QueryObserverOptions,
} from "@tanstack/solid-query";
import {
	type TRPCClientErrorLike,
	createTRPCClient,
	getUntypedClient,
	httpBatchLink,
} from "@trpc/client";
import type {
	AnyTRPCProcedure,
	TRPCRouterRecord,
	inferProcedureInput,
	inferTransformedProcedureOutput,
} from "@trpc/server";
import type { Accessor } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";
import superjson from "superjson";
import type { IAppRouter } from "~/server/trpc/routers/mainRouter";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return "";

	return `${
		!import.meta.env.VITE_SITE ? process.env.SITE_URL : "http://localhost:3000"
	}`;
};

// ---------------------------------------------------------------------------
// Vanilla tRPC v11 client
// ---------------------------------------------------------------------------
export const client = createTRPCClient<IAppRouter>({
	links: [
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
			// v11: the transformer lives on the link, not the client
			transformer: superjson,
			headers: () => {
				// Forward the incoming request headers (cookies) during SSR
				const event = isServer ? getRequestEvent() : null;
				return event ? Object.fromEntries(event.request.headers) : {};
			},
		}),
	],
});

const untypedClient = getUntypedClient(client);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ClientError = TRPCClientErrorLike<IAppRouter>;
type Input<P extends AnyTRPCProcedure> = inferProcedureInput<P>;
type Output<P extends AnyTRPCProcedure> = inferTransformedProcedureOutput<
	IAppRouter,
	P
>;

type QueryOpts<P extends AnyTRPCProcedure> = Omit<
	QueryObserverOptions<Output<P>, ClientError, Output<P>, Output<P>, QueryKey>,
	"queryKey" | "queryFn"
>;

type Cursor<P extends AnyTRPCProcedure> = NonNullable<Input<P>> extends {
	cursor?: infer C;
}
	? C
	: never;

type InfiniteOpts<P extends AnyTRPCProcedure> = Omit<
	QueryObserverOptions<Output<P>, ClientError>,
	| "queryKey"
	| "queryFn"
	| "select"
	| "placeholderData"
	| "initialData"
	| "getNextPageParam"
	| "getPreviousPageParam"
	| "initialPageParam"
> & {
	getNextPageParam: (
		lastPage: Output<P>,
		allPages: Output<P>[],
	) => Cursor<P> | undefined | null;
	getPreviousPageParam?: (
		firstPage: Output<P>,
		allPages: Output<P>[],
	) => Cursor<P> | undefined | null;
	initialPageParam?: Cursor<P>;
	maxPages?: number;
};

type MutationOpts<P extends AnyTRPCProcedure> = Omit<
	MutationObserverOptions<Output<P>, ClientError, Input<P>, unknown>,
	"mutationFn" | "mutationKey"
>;

type DecorateQuery<P extends AnyTRPCProcedure> = {
	createQuery: (
		...args: undefined extends Input<P>
			? [input?: Accessor<Input<P>>, opts?: Accessor<QueryOpts<P>>]
			: [input: Accessor<Input<P>>, opts?: Accessor<QueryOpts<P>>]
	) => CreateQueryResult<Output<P>, ClientError>;
} & ("cursor" extends keyof NonNullable<Input<P>>
	? {
			createInfiniteQuery: (
				input: Accessor<Omit<NonNullable<Input<P>>, "cursor">>,
				opts: Accessor<InfiniteOpts<P>>,
			) => CreateInfiniteQueryResult<
				InfiniteData<Output<P>, Cursor<P>>,
				ClientError
			>;
		}
	: unknown);

type DecorateMutation<P extends AnyTRPCProcedure> = {
	createMutation: (
		opts?: Accessor<MutationOpts<P>>,
	) => CreateMutationResult<Output<P>, ClientError, Input<P>, unknown>;
};

type DecorateRecord<R extends TRPCRouterRecord> = {
	[K in keyof R]: R[K] extends AnyTRPCProcedure
		? R[K]["_def"]["type"] extends "query"
			? DecorateQuery<R[K]>
			: R[K]["_def"]["type"] extends "mutation"
				? DecorateMutation<R[K]>
				: never
		: R[K] extends TRPCRouterRecord
			? DecorateRecord<R[K]>
			: never;
};

// ---------------------------------------------------------------------------
// Runtime proxy
// ---------------------------------------------------------------------------
type ProxyCallback = (path: string[], args: unknown[]) => unknown;

// biome-ignore lint/suspicious/noExplicitAny: proxy is typed via DecorateRecord
function createRecursiveProxy(cb: ProxyCallback, path: string[] = []): any {
	return new Proxy(() => {}, {
		get(_target, key) {
			if (typeof key !== "string" || key === "then") return undefined;
			return createRecursiveProxy(cb, [...path, key]);
		},
		apply(_target, _thisArg, args) {
			return cb(path, args);
		},
	});
}

type AnyAccessor = Accessor<unknown> | undefined;
type AnyOptsAccessor = Accessor<Record<string, unknown>> | undefined;

export const trpc: DecorateRecord<IAppRouter["_def"]["record"]> =
	createRecursiveProxy((fullPath, args) => {
		const path = fullPath.slice(0, -1).join(".");
		const util = fullPath[fullPath.length - 1];
		const [first, second] = args;

		switch (util) {
			case "createQuery": {
				const input = first as AnyAccessor;
				const opts = second as AnyOptsAccessor;
				return createQuery(() => {
					const i = input?.();
					return {
						...opts?.(),
						queryKey: [path.split("."), { input: i, type: "query" }],
						queryFn: ({ signal }) => untypedClient.query(path, i, { signal }),
					};
				});
			}
			case "createInfiniteQuery": {
				const input = first as AnyAccessor;
				const opts = second as AnyOptsAccessor;
				return createInfiniteQuery(() => {
					const i = (input?.() ?? {}) as Record<string, unknown>;
					return {
						initialPageParam: null,
						getNextPageParam: () => undefined,
						...opts?.(),
						queryKey: [path.split("."), { input: i, type: "infinite" }],
						queryFn: ({ pageParam, signal }) =>
							untypedClient.query(
								path,
								{ ...i, cursor: pageParam },
								{ signal },
							),
					};
				});
			}
			case "createMutation": {
				const opts = first as AnyOptsAccessor;
				return createMutation(() => ({
					...opts?.(),
					mutationKey: [path.split(".")],
					mutationFn: (input: unknown) => untypedClient.mutation(path, input),
				}));
			}
			default:
				throw new Error(`trpc: unknown method "${util}" on "${path}"`);
		}
	});

// ---------------------------------------------------------------------------
// Query client
// ---------------------------------------------------------------------------
// Created once per App render: once in the browser, and once per request on
// the server (SSR), so cached query data is never shared between users.
export const createQueryClient = () => {
	const queryClient: QueryClient = new QueryClient({
		defaultOptions: {
			queries: {
				suspense: true,
				experimental_prefetchInRender: true,
				placeholderData: keepPreviousData,
			},
		},
		mutationCache: new MutationCache({
			onSuccess: () => {
				queryClient.invalidateQueries();
			},
		}),
	});
	return queryClient;
};
