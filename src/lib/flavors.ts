import flavorsData from "../../data/flavors.json";
import { pokemon, type Pokemon } from "./pokemon";

export type FlavorItem = {
  name: string;
  image: string;
};

export type Flavor = {
  name: string;
  items: FlavorItem[];
};

export const flavors = flavorsData as Flavor[];

export function pokemonForFlavor(flavor: Flavor): Pokemon[] {
  const pattern = new RegExp(`^${flavor.name}\\s+flavors?$`, "i");
  return pokemon.filter((p) => p.favorites.some((f) => pattern.test(f)));
}
