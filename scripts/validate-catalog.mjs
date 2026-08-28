import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync(":memory:");
database.exec(readFileSync(new URL("../db/migrations/0001_catalog.sql", import.meta.url), "utf8"));

const expectedCounts = {
    shirt_materials: 2,
    shirt_sizes: 7,
    shirt_fits: 2,
    shirt_colors: 10,
    print_methods: 1,
    design_categories: 15,
};

for (const [table, expected] of Object.entries(expectedCounts)) {
    const row = database.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
    if (row.count !== expected) {
        throw new Error(`${table}: expected ${expected} rows, received ${row.count}`);
    }
}

const integrity = database.prepare("PRAGMA integrity_check").get();
if (integrity.integrity_check !== "ok") throw new Error("Catalog migration failed integrity check");

console.log("Catalog migration is valid: 2 materials, 7 sizes, 2 fits, 10 colors, 1 print method, 15 categories.");
