import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";
import { v4 as uuidv4 } from "uuid";
import {
	appendResponseHeader,
	getCookie
} from "vinxi/server";

import { db } from "~/server/database/db";

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	const user = getCookie("user");
	let id: string;
	if (!user) {
		if (process.env.DEMO) {
			const userDb = await db
				.insertInto("user")
				.values({ id: uuidv4() })
				.returning("id")
				.executeTakeFirstOrThrow();
			appendResponseHeader("Set-Cookie", userDb.id);
			id = userDb.id;
		} else {
			const userDb = await db
				.selectFrom("user")
				.select(["id"])
				.executeTakeFirstOrThrow();
			if (!userDb.id) {
				const userDb = await db
					.insertInto("user")
					.values({ id: uuidv4() })
					.returning("id")
					.executeTakeFirstOrThrow();
				appendResponseHeader("Set-Cookie", userDb.id);
				id = userDb.id;
			} else {
				id = userDb.id;
			}
		}
	} else {
		id = user;
	}
	return { db, id, req: opts.req, res: opts.res };
};
