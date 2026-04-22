import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "data", "pokemon.json");

// Placements identified from the Pokopia community tier list images
// (Sour / Sweet / Spicy sections) provided by user.
// Only high-confidence sprite identifications are included.
// The label format matches existing entries: "<Flavor> Flavors".
const ASSIGNMENTS = {
  // --- SOUR ---
  "Bellossom": "Sour Flavors",
  "Tangela": "Sour Flavors",
  "Shellos": "Sour Flavors",
  "Shellos East Sea": "Sour Flavors",
  "Gastrodon": "Sour Flavors",
  "Gastrodon East Sea": "Sour Flavors",
  "Wigglytuff": "Sour Flavors",
  "Dedenne": "Sour Flavors",

  // --- SWEET ---
  "Abra": "Sweet Flavors",
  "Poliwag": "Sweet Flavors",
  "Zorua": "Sweet Flavors",
  "Mawile": "Sweet Flavors",
  "Drifloon": "Sweet Flavors",

  // --- SPICY ---
  "Golbat": "Spicy Flavors",
  "Flygon": "Spicy Flavors",
  "Noibat": "Spicy Flavors",
  "Noivern": "Spicy Flavors",
  "Ho-Oh": "Spicy Flavors",
  "Volbeat": "Spicy Flavors",
  "Lampent": "Spicy Flavors",
  "Vikavolt": "Spicy Flavors",
};

const main = async () => {
  const data = JSON.parse(await fs.readFile(FILE, "utf8"));

  const updated = [];
  const skipped = [];

  for (const p of data) {
    const flavor = ASSIGNMENTS[p.name];
    if (!flavor) continue;

    const already = p.favorites.some(
      (f) => f.toLowerCase() === flavor.toLowerCase()
    );
    if (already) {
      skipped.push(`${p.name} (already has ${flavor})`);
      continue;
    }
    p.favorites.push(flavor);
    updated.push(`${p.name} ← ${flavor}`);
  }

  await fs.writeFile(FILE, JSON.stringify(data, null, 2) + "\n", "utf8");

  console.log(`Updated ${updated.length} Pokémon:`);
  for (const line of updated) console.log(`  + ${line}`);
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length}:`);
    for (const line of skipped) console.log(`  · ${line}`);
  }

  const stillEmpty = data.filter((p) => p.favorites.length === 0);
  console.log(`\nStill with empty favorites: ${stillEmpty.length}`);
  for (const p of stillEmpty) console.log(`  - ${p.name}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
