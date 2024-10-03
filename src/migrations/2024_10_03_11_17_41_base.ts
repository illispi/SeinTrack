import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("date")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("hours_worked", "decimal")
		.addColumn("date", "timestamp", (col) => col.defaultTo(null))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("date").ifExists().execute();
}
