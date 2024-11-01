import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";

import { db } from "~/server/database/db";

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	console.log(process.env.DATABASE_URL);
	return { db, req: opts.req, res: opts.res };
};
