import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context as HonoContext } from "hono";
import { getCookie } from "hono/cookie";
import { serialize } from "hono/utils/cookie";

import { db } from "~/server/database/db";

// Previously used vinxi/server getCookie/setCookie (SolidStart only).
// Cookies are now read through Hono and written via tRPC's resHeaders,
// which the fetch adapter copies onto the final response.
export const createContext = async (
	opts: FetchCreateContextFnOptions,
	c: HonoContext,
) => {
	const user = getCookie(c, "user");
	let id: string;
	const date = new Date();
	date.setFullYear(date.getFullYear() + 1); // Add one year to the current date

	const setUserCookie = (value: string) => {
		opts.resHeaders.append(
			"Set-Cookie",
			serialize("user", value, { httpOnly: true, expires: date, path: "/" }),
		);
	};

	const createUser = async () => {
		const userDb = await db
			.insertInto("user")
			.values({ id: crypto.randomUUID() })
			.returning("id")
			.executeTakeFirstOrThrow();
		setUserCookie(userDb.id);
		return userDb.id;
	};

	const resolveUser = async () => {
		if (process.env.DEMO) {
			return createUser();
		}
		// Single-user mode: reuse the existing user, or create it on a fresh DB.
		const userDb = await db
			.selectFrom("user")
			.select(["id"])
			.executeTakeFirst();
		if (!userDb?.id) {
			return createUser();
		}
		setUserCookie(userDb.id);
		return userDb.id;
	};

	if (!user) {
		id = await resolveUser();
	} else {
		const exists = await db
			.selectFrom("user")
			.select("id")
			.where("id", "=", user)
			.executeTakeFirst();
		id = exists?.id ? user : await resolveUser();
	}

	return { db, id, req: opts.req, resHeaders: opts.resHeaders };
};
