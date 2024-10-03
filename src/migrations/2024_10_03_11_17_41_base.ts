import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("date_rows")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("hours_worked", "numeric")
		.addColumn("dates", "timestamp", (col) => col.defaultTo(null))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("date_rows").ifExists().execute();
}
