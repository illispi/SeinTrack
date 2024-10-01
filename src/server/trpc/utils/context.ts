import { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";
import { initTRPC } from "@trpc/server";
import { db } from "~/server/database/db";

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	return { db, req: opts.req, res: opts.res };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;