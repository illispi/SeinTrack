import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const convertToIso = (n: number) => {
	return n.toString().length > 1 ? n : `0${n.toString()}`;
};

const date = new Date();
const year = date.getFullYear();
const month = convertToIso(date.getMonth() + 1);
const day = convertToIso(date.getDate());
const hours = convertToIso(date.getHours());
const minutes = convertToIso(date.getMinutes());
const seconds = convertToIso(date.getSeconds());

const code = `import type { Kysely } from 'kysely'
import { sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {

}

export async function down(db: Kysely<any>): Promise<void> {

}`;

const name = process.argv.slice(2).join("_").toLowerCase();

if (!name) {
	console.log("missing migration name, add as argument to command");
} else {
	writeFileSync(
		resolve(
			__dirname,
			`../migrations/${year}_${month}_${day}_${hours}_${minutes}_${seconds}_${name}.ts`,
		),
		code,
	);
}
