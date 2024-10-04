import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";

import { db } from "~/server/database/db";

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	return { db, req: opts.req, res: opts.res };
};


