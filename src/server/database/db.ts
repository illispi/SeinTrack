import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import pkg from "pg";
const { Pool } = pkg;
//import { Pool } from "pg";

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const dialect = new PostgresDialect({
	pool,
});

export const db = new Kysely<DB>({
	log: ["error"],
	dialect,
    plugins: [new CamelCasePlugin()],
});
