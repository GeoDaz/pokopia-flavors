import pokemonData from "../../data/pokemon.json";
import translationsFr from "../../data/pokemon-fr.json";

export type Pokemon = {
  name: string;
  nameFr: string;
  image: string;
  url: string;
  specialty: string | null;
  favorites: string[];
};

const frMap = translationsFr as Record<string, string>;

export const pokemon: Pokemon[] = (pokemonData as Omit<Pokemon, "nameFr">[]).map(
  (p) => ({ ...p, nameFr: frMap[p.name] ?? p.name })
);

export function slugOf(p: Pokemon): string {
  return p.url.split("/").pop() ?? p.name.toLowerCase();
}

export function findBySlug(slug: string): Pokemon | undefined {
  return pokemon.find((p) => slugOf(p) === slug);
}
