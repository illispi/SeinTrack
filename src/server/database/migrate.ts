import type { Migration, MigrationProvider } from "kysely/migration";
import { Migrator } from "kysely/migration";
import { db } from "./db";

// Vite bundles every migration file into the server build, so migrations can
// run from the built app/Docker image without tsx or the src/ folder.
// Names match the file names (without .ts), the same keys `pnpm migrate:latest`
// (FileMigrationProvider) writes to the kysely_migration table.
const modules = import.meta.glob<Migration>("../../migrations/*.ts", {
	eager: true,
});

const provider: MigrationProvider = {
	async getMigrations() {
		const migrations: Record<string, Migration> = {};
		for (const [path, migration] of Object.entries(modules)) {
			const name = path.split("/").pop()?.replace(/\.ts$/, "");
			if (name) migrations[name] = migration;
		}
		return migrations;
	},
};

let migrating: Promise<void> | undefined;

/**
 * Runs pending migrations once per server process. Concurrent callers share
 * the same run; Kysely also takes a database lock, so several instances
 * starting at once are safe. Set MIGRATE_ON_START=false to turn it off.
 */
export const migrateOnStart = (): Promise<void> => {
	if (process.env.MIGRATE_ON_START === "false") return Promise.resolve();

	migrating ??= (async () => {
		const migrator = new Migrator({
			// Same as src/tools/migrate.ts: no CamelCasePlugin for schema changes.
			db: db.withoutPlugins(),
			provider,
		});
		const { error, results } = await migrator.migrateToLatest();

		for (const it of results ?? []) {
			if (it.status === "Success") {
				console.log(`[migrate] applied ${it.migrationName}`);
			} else if (it.status === "Error") {
				console.error(`[migrate] failed ${it.migrationName}`);
			}
		}
		if (error) throw error;
		if (!results?.length) console.log("[migrate] database is up to date");
	})().catch((error) => {
		// Let the next request try again instead of caching the failure.
		migrating = undefined;
		console.error("[migrate] failed to migrate", error);
		throw error;
	});

	return migrating;
};
