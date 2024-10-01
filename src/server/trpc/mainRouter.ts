import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";
import { initTRPC } from "@trpc/server";
import { db } from "../database/db";
import { publicProcedure, router } from "./utils/context";

export const appRouter = router({
	test: publicProcedure.query(() => {
		console.log("hello");
		return {
			message: "hello world",
		};
	}),
});

export type IAppRouter = typeof appRouter;
