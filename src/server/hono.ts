import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/routers/mainRouter";
import { createContext } from "./trpc/context";
import { db } from "./database/db";

const app = new Hono();

app.use(async (c, next) => {
	await next();
	if (c.res.status !== 200) {
		// const obj = { result: { data: { json: "hello" } } };
		const obj = { result: { data: { json: "hello" } } };
		// const obj = {
		// 	error: {
		// 		json: {
		// 			message: "NOT_FOUND",
		// 			code: -32004,
		// 			data: {
		// 				code: "NOT_FOUND",
		// 				httpStatus: 404,
		// 				stack:
		// 					"TRPCError: NOT_FOUND\n    at eval (/home/sam/repos/SeinTrack/src/server/trpc/routers/mainRouter.ts:11:11)\n    at resolveMiddleware (file:///home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/index.mjs:421:36)\n    at callRecursive (file:///home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/index.mjs:451:38)\n    at resolve (file:///home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/index.mjs:481:30)\n    at Object.callProcedure (/home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/config-194bdd43.js:157:12)\n    at inputToProcedureCall (/home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/resolveHTTPResponse-b7a8a1c9.js:48:35)\n    at /home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/resolveHTTPResponse-b7a8a1c9.js:171:51\n    at Array.map (<anonymous>)\n    at Object.resolveHTTPResponse (/home/sam/repos/SeinTrack/node_modules/@trpc/server/dist/resolveHTTPResponse-b7a8a1c9.js:171:32)",
		// 				path: "test",
		// 			},
		// 		},
		// 	},
		// };

		const blob = new Blob([JSON.stringify(obj, null, 2)], {
			type: "application/json",
		});
		console.log(c.res.status);
		const myOptions = {
			status: c.res.status,
			statusText: "SuperSmashingGreat!",
		};
		c.res = new Response(blob, myOptions);
	}
});

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
