import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const manifestPath = resolve("public/models/tshirts/colors/manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const errors = [];

for (const [color, entry] of Object.entries(manifest)) {
    if (!entry.fa || !entry.hex || !Array.isArray(entry.files) || entry.files.length !== 4) {
        errors.push(`${color}: invalid manifest entry`);
        continue;
    }

    for (const file of entry.files) {
        if (!existsSync(resolve("public", file))) errors.push(`${color}: missing ${file}`);
    }
}

if (Object.keys(manifest).length !== 10) errors.push(`expected 10 colors, received ${Object.keys(manifest).length}`);
if (errors.length) throw new Error(errors.join("\n"));

console.log("T-shirt image manifest is valid: 10 colors and 40 front/back fit images.");
