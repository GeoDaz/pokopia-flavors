import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TRANSLATIONS_PATH =
  "//wsl.localhost/Ubuntu/home/geoffrey/dataprovider-pokemon-showdown/json/translations/pokemons_translations.json";
const POKEMON_PATH = path.join(ROOT, "data", "pokemon.json");
const OUT_PATH = path.join(ROOT, "data", "pokemon-fr.json");

const OVERRIDES = {
  "Peakychu": "Peakychu",
  "Mosslax": "Mosslax",
  "Professor Tangrowth": "Professeur Bouldeneu",
  "Stereo Rotom": "Motisma Stéréo",
};

const candidateKeys = (name) => {
  const keys = [name];
  keys.push(name.replace(/'/g, "\u2019"));
  keys.push(name.replace(/\u2019/g, "'"));

  const formMatch = name.match(/^(.+?) ([A-Z][A-Za-z]+) Form$/);
  if (formMatch) {
    keys.push(`${formMatch[1]}-${formMatch[2]}`);
  }
  const multiFormMatch = name.match(/^(.+?) ((?:[A-Z][A-Za-z]+ ){1,}[A-Z][A-Za-z]+) Form$/);
  if (multiFormMatch) {
    keys.push(`${multiFormMatch[1]}-${multiFormMatch[2].replace(/ /g, "-")}`);
  }
  const paldean = name.match(/^Paldean (.+)$/);
  if (paldean) keys.push(`${paldean[1]}-Paldea`);
  const eastSea = name.match(/^(.+) East Sea$/);
  if (eastSea) keys.push(`${eastSea[1]}-East`);
  const westSea = name.match(/^(.+) West Sea$/);
  if (westSea) keys.push(`${westSea[1]}-West`);

  if (name === "Toxtricity Amped Form") keys.push("Toxtricity");
  if (name === "Toxtricity Low Key Form") keys.push("Toxtricity-Low-Key");

  return [...new Set(keys)];
};

const main = async () => {
  const translationsRaw = await fs.readFile(TRANSLATIONS_PATH, "utf8");
  const translations = JSON.parse(translationsRaw);
  const pokemon = JSON.parse(await fs.readFile(POKEMON_PATH, "utf8"));

  const result = {};
  const missing = [];

  for (const p of pokemon) {
    if (OVERRIDES[p.name]) {
      result[p.name] = OVERRIDES[p.name];
      continue;
    }
    let matched = null;
    for (const key of candidateKeys(p.name)) {
      if (translations[key]) {
        matched = translations[key];
        break;
      }
    }
    if (matched) {
      result[p.name] = matched;
    } else {
      missing.push(p.name);
    }
  }

  await fs.writeFile(OUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log(`Matched: ${Object.keys(result).length}/${pokemon.length}`);
  console.log(`Missing: ${missing.length}`);
  if (missing.length) {
    for (const name of missing) console.log(`  - ${name}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
