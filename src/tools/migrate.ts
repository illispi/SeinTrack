import * as path from "node:path";
import PG from "pg";
const Pool = PG.Pool;
import { promises as fs } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
// import { Database } from "./dbTypes";
// Kysely 0.29 moved the migration API to the "kysely/migration" entry point.
import { Kysely, PostgresDialect } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely/migration";
// import { env } from "./env";

const __dirname = fileURLToPath(new URL("../", import.meta.url));

// Load .env if present (Node >= 21.7; replaces the dotenv package).
try {
	process.loadEnvFile();
} catch {
	// no .env file: rely on the real environment
}

async function migrateToLatest(dir: string[]) {
	console.log(dir);

	const db = new Kysely<any>({
		//TODO replace any with Database types
		log: ["error", "query"],
		dialect: new PostgresDialect({
			pool: new Pool({
				connectionString: process.env.DATABASE_URL,
			}),
		}),
	});

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: path.join(__dirname, "migrations"),
			// import() needs a file:// URL for absolute Windows paths (C:\...)
			import: (filePath) => import(pathToFileURL(filePath).href),
		}),
	});

	console.log(path.join(__dirname, "migrations"));

	const { error, results } =
		dir[0] === "down"
			? await migrator.migrateDown()
			: await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === "Success") {
			console.log(`migration "${it.migrationName}" was executed successfully`);
		} else if (it.status === "Error") {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	});

	if (error) {
		console.error("failed to migrate");
		console.error(error);
		process.exit(1);
	}

	await db.destroy();
}

migrateToLatest(process.argv.slice(2));

//BUG is migratedown supposed to be run multiple times
