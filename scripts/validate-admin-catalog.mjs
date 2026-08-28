import { readdirSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync(":memory:");
for (const migration of readdirSync(new URL("../db/migrations/", import.meta.url)).filter((name) => name.endsWith(".sql")).sort()) {
    database.exec(readFileSync(new URL(`../db/migrations/${migration}`, import.meta.url), "utf8"));
}

const expected = { design_categories: 15, placement_options: 6, shirt_colors: 10 };
for (const [table, count] of Object.entries(expected)) {
    const actual = database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
    if (actual !== count) throw new Error(`${table}: expected ${count}, received ${actual}`);
}
const integrity = database.prepare("PRAGMA integrity_check").get().integrity_check;
if (integrity !== "ok") throw new Error(`Database integrity check failed: ${integrity}`);
console.log("Admin catalog migrations are valid.");
