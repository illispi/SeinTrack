import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { createContext } from "./context";

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
