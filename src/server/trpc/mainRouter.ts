import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";
import { initTRPC } from "@trpc/server";
import { db } from "../database/db";

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	return { db, req: opts.req, res: opts.res };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
	test: publicProcedure.query(() => {
		console.log("hello");
		return {
			message: "hello world",
		};
	}),
});

export type IAppRouter = typeof appRouter;
