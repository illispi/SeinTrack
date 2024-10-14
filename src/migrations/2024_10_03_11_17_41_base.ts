import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("projects")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull())
		.addColumn("target_hours", "float4", (col) => col.defaultTo(3).notNull());
	await db.schema
		.createTable("dates")
		//projects ref
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("hours_worked", "float4")
		.addColumn("date", "timestamp", (col) => col.defaultTo(null))
		.execute();
	await db.schema
		.createTable("todos")
		.addColumn("id", "serial", (col) => col.primaryKey())
		// tag ref must be included
		.addColumn("todo", "text", (col) => col.notNull());

	await db.schema
		.createTable("tag_groups")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("tag_group", "text");

	await db.schema
		.createTable("tags")
		.addColumn("id", "serial", (col) => col.primaryKey())
		//tag groups ref
		.addColumn("tag", "text");
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("todos").ifExists().execute();
	await db.schema.dropTable("dates").ifExists().execute();
	await db.schema.dropTable("project").ifExists().execute();
}
