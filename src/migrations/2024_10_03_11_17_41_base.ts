import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("projects")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("name", "text", (col) => col.notNull().unique())
		.addColumn("target_hours", "float4", (col) => col.defaultTo(3).notNull())
		.execute();
	await db.schema
		.createTable("dates")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("project_id", "integer", (col) =>
			col.references("projects.id").onDelete("cascade").notNull(),
		)
		.addColumn("hours_worked", "float4")
		.addColumn("date", "timestamp", (col) => col.defaultTo(null))
		.execute();

	await db.schema
		.createTable("tag_groups")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("tag_group", "text", (col) => col.notNull().unique())
		.addColumn("tag_group_active", "boolean", (col) => col.notNull())
		.execute();

	await db.schema
		.createTable("tags")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("tag", "text", (col) => col.notNull().unique())
		.addColumn("tag_active", "boolean", (col) => col.notNull())
		.addColumn("project_id", "integer", (col) =>
			col.references("projects.id").onDelete("cascade").notNull(),
		)
		.execute();

	await db.schema
		.createTable("todos")
		.addColumn("id", "serial", (col) => col.primaryKey())
		.addColumn("tag_id", "integer", (col) => col.references("tags.id"))
		.addColumn("project_id", "integer", (col) =>
			col.references("projects.id").onDelete("cascade").notNull(),
		)
		.addColumn("date_id", "integer", (col) => col.references("dates.id"))
		.addColumn("tag_group_id", "integer", (col) =>
			col.references("tag_groups.id").notNull(),
		)
		.addColumn("todo", "text", (col) => col.notNull())
		.addColumn("hours_worked", "float4")
		.addColumn("completed", "boolean")
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("todos").ifExists().execute();
	await db.schema.dropTable("tags").ifExists().execute();
	await db.schema.dropTable("tag_groups").ifExists().execute();
	await db.schema.dropTable("dates").ifExists().execute();
	await db.schema.dropTable("projects").ifExists().execute();
}
