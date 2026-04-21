import { headers } from "next/headers";

export type Locale = "fr" | "en";

export async function detectLocale(): Promise<Locale> {
  const h = await headers();
  const header = h.get("accept-language") ?? "";
  const primary = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return primary.startsWith("fr") ? "fr" : "en";
}

export function pokemonLabel(
  p: { name: string; nameFr: string },
  locale: Locale
): string {
  return locale === "fr" ? p.nameFr : p.name;
}
