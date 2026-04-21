import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import pLimit from "p-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE_URL = "https://www.pokopiawiki.com";
const LIST_FILE = path.join(__dirname, "pokedex-list.json");
const OUT_FILE = path.join(ROOT, "data", "pokemon.json");

const CONCURRENCY = 8;
const MAX_RETRIES = 3;

async function fetchHtml(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PokopiaScraper/1.0; +https://pokopia.local)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
      return fetchHtml(url, attempt + 1);
    }
    throw err;
  }
}

function parseDetail(html) {
  const $ = cheerio.load(html);

  const specialties = [];
  $('a[href^="/specialties"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href === "/specialties" || href === "/specialties/") return;
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text) specialties.push(text);
  });
  const specialty = [...new Set(specialties)][0] ?? null;

  const favorites = [];
  $("h2, h3, p").each((_, el) => {
    const label = $(el).text().trim();
    if (/^Favorites?$/i.test(label)) {
      const container = $(el).next();
      container.find("span").each((_, s) => {
        const t = $(s).text().trim();
        if (t) favorites.push(t);
      });
    }
  });
  const uniqueFavorites = [...new Set(favorites)];

  return { specialty, favorites: uniqueFavorites };
}

async function main() {
  const list = JSON.parse(await fs.readFile(LIST_FILE, "utf8"));
  console.log(`Loaded ${list.length} pokemon entries.`);

  const limit = pLimit(CONCURRENCY);
  let done = 0;
  const results = await Promise.all(
    list.map((entry) =>
      limit(async () => {
        const url = BASE_URL + entry.url;
        try {
          const html = await fetchHtml(url);
          const { specialty, favorites } = parseDetail(html);
          done++;
          if (done % 20 === 0 || done === list.length) {
            console.log(`  ${done}/${list.length} — ${entry.name}`);
          }
          return {
            name: entry.name,
            image: entry.image,
            url,
            specialty,
            favorites,
          };
        } catch (err) {
          console.error(`  ! ${entry.name} (${url}): ${err.message}`);
          return {
            name: entry.name,
            image: entry.image,
            url,
            specialty: null,
            favorites: [],
            error: err.message,
          };
        }
      })
    )
  );

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(results, null, 2) + "\n", "utf8");
  const missing = results.filter((r) => !r.specialty || r.favorites.length === 0);
  console.log(`Wrote ${results.length} entries to ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`Entries with missing specialty or favorites: ${missing.length}`);
  if (missing.length && missing.length <= 20) {
    for (const m of missing) {
      console.log(`  - ${m.name} — specialty=${m.specialty} favorites=${m.favorites.length}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
