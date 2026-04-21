'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import type { Flavor } from '@/lib/flavors';
import type { Locale } from '@/lib/locale';
import { type Pokemon } from '@/lib/pokemon';

type Row = { flavor: Flavor; pokemon: Pokemon[] };

const COPY = {
	en: {
		searchPlaceholder: 'Search Pokémon by name',
		searchLabel: 'Search Pokémon by name',
		headerFlavor: 'Flavor',
		headerPokemon: 'Pokémon who love it',
		itemsLabel: (p: number, i: number) => `${p} Pokémon · ${i} items`,
		matches: (n: number) => `${n} match${n === 1 ? '' : 'es'}`,
		none: 'No Pokémon found.',
		noneFiltered: 'No matching Pokémon.',
	},
	fr: {
		searchPlaceholder: 'Rechercher un Pokémon (FR / EN)',
		searchLabel: 'Rechercher un Pokémon par son nom',
		headerFlavor: 'Saveur',
		headerPokemon: "Pokémon qui l'adorent",
		itemsLabel: (p: number, i: number) => `${p} Pokémon · ${i} objets`,
		matches: (n: number) => `${n} résultat${n === 1 ? '' : 's'}`,
		none: 'Aucun Pokémon trouvé.',
		noneFiltered: 'Aucun Pokémon correspondant.',
	},
} as const;

const normalize = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

export default function FlavorsTable({ rows, locale }: { rows: Row[]; locale: Locale }) {
	const [query, setQuery] = useState('');
	const copy = COPY[locale];

	const normalized = normalize(query.trim());
	const filteredRows = useMemo(() => {
		if (!normalized) return rows;
		return rows.map(row => ({
			...row,
			pokemon: row.pokemon.filter(
				p =>
					normalize(p.name).includes(normalized) ||
					(locale === 'fr' && normalize(p.nameFr).includes(normalized))
			),
		}));
	}, [rows, normalized, locale]);

	const totalMatches = filteredRows.reduce((sum, r) => sum + r.pokemon.length, 0);

	const labelOf = (p: Pokemon) => (locale === 'fr' ? p.nameFr : p.name);

	return (
		<>
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<label htmlFor="pokemon-search" className="sr-only">
					{copy.searchLabel}
				</label>
				<input
					id="pokemon-search"
					type="search"
					placeholder={copy.searchPlaceholder}
					value={query}
					onChange={e => setQuery(e.target.value)}
					className="flex-1 min-w-[14rem] rounded-full border border-[#d6c3a1] bg-[#fffdf8] px-4 py-2 text-sm outline-none placeholder:text-[#b8a885] focus:border-[#7f6f5a]"
				/>
				{normalized && (
					<span className="text-xs font-bold uppercase tracking-widest text-[#7f6f5a]">
						{copy.matches(totalMatches)}
					</span>
				)}
			</div>

			<div className="overflow-hidden rounded-xl border border-[#d6c3a1] bg-[#fffdf8]">
				<table className="w-full border-collapse">
					<thead>
						<tr className="border-b border-[#d6c3a1] bg-[#f1ece2] text-left text-xs font-black uppercase tracking-[0.16em] text-[#7f6f5a]">
							<th className="w-64 px-4 py-3">{copy.headerFlavor}</th>
							<th className="px-4 py-3">{copy.headerPokemon}</th>
						</tr>
					</thead>
					<tbody>
						{filteredRows.map(({ flavor, pokemon }) => (
							<tr
								key={flavor.name}
								className="border-b border-[#ece5d8] last:border-b-0 align-top"
							>
								<td className="w-64 px-4 py-4 border-r border-[#ece5d8]">
									<span className="text-base font-black uppercase tracking-wider">
										{flavor.name}
									</span>
									<p className="mt-0.5 text-xs text-[#7f6f5a]">
										{copy.itemsLabel(
											pokemon.length,
											flavor.items.length
										)}
									</p>
									<ul className="mt-3 flex flex-wrap gap-2">
										{flavor.items.map(item => (
											<li
												key={item.name}
												title={item.name}
												className="flex flex-col items-center gap-1 rounded-lg bg-[#f5f1e8] p-1.5"
											>
												<div className="relative h-12 w-12">
													<Image
														src={item.image}
														alt={item.name}
														fill
														sizes="48px"
														className="object-contain"
														unoptimized
													/>
												</div>
												<span className="max-w-[4.5rem] truncate text-center text-[10px] font-bold text-[#5f4f3a]">
													{item.name}
												</span>
											</li>
										))}
									</ul>
								</td>
								<td className="px-4 py-4">
									{pokemon.length > 0 ?
										<ul className="flex flex-wrap gap-2">
											{pokemon.map(p => (
												<li key={p.url}>
													<a
														href={p.url}
														target="_blank"
														rel="noopener noreferrer"
														title={`${p.name} / ${p.nameFr}`}
														className="group flex flex-col items-center gap-1 rounded-lg p-1.5 transition hover:bg-[#f1ece2]"
													>
														<div className="relative h-17 w-17">
															<Image
																src={p.image}
																alt={labelOf(p)}
																fill
																sizes="68px"
																className="object-contain"
																unoptimized
															/>
														</div>
														<span className="max-w-[4.5rem] truncate text-center text-[10px] font-bold text-[#5f4f3a]">
															{labelOf(p)}
														</span>
													</a>
												</li>
											))}
										</ul>
									:	<p className="text-sm italic text-[#7f6f5a]">
											{normalized ? copy.noneFiltered : copy.none}
										</p>
									}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
