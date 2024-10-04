import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/routers/mainRouter";

const app = new Hono();

// Custom endpoint configuration
app.use(
	"/api/trpc/*",
	trpcServer({
		endpoint: "/api/trpc",
		router: appRouter,
		// onError(opts) {
		// 	const { error, type, path, input, ctx, req } = opts;
		// 	return error.code;
		// },
	}),
);

export default app;
