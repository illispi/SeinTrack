
import { publicProcedure, router } from "./utils/context";

export const appRouter = router({
	test: publicProcedure.query(() => {
		return {
			message: "hello world",
		};
	}),
});

export type IAppRouter = typeof appRouter;
