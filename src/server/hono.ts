import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/routers/mainRouter";
import { createContext } from "./trpc/context";
import { db } from "./database/db";

const app = new Hono();

// Custom endpoint configuration
app.use(
	"/api/trpc/*",
	trpcServer({
		endpoint: "/api/trpc",
		router: appRouter,
		createContext: (opts, c) => ({ db, req: c.req, res: c.res }),
	}),
);

export default app;
