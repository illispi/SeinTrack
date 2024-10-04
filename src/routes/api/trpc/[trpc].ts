import type { APIEvent } from "@solidjs/start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import app from "~/server/hono";
import { appRouter } from "~/server/trpc/routers/mainRouter";
import { createContext } from "~/server/trpc/context";

const handler = (event: APIEvent) =>
	fetchRequestHandler({
		// the endpoint handling the requests
		endpoint: "/api/trpc",
		// the request object
		req: event.request,
		// the router for handling the requests
		router: appRouter,
		// any arbitary data that should be available to all actions
		createContext,
	});

export const GET = handler;
export const POST = handler;
