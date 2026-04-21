import { flavors, pokemonForFlavor } from '@/lib/flavors';
import { detectLocale } from '@/lib/locale';
import FlavorsTable from './flavors-table';

const SOURCE_URL = 'https://www.pokopiawiki.com/';

export default async function FlavorsPage() {
	const locale = await detectLocale();
	const rows = flavors.map(flavor => ({
		flavor,
		pokemon: pokemonForFlavor(flavor),
	}));

	const t =
		locale === 'fr' ?
			{
				title: 'POKOPIA\u00A0: Pokémon regroupés par saveurs',
				credit: 'Données issues de',
				creditLink: 'pokopiawiki.com',
			}
		:	{
				title: 'POKOPIA\u00A0: Pokémon grouped by the flavors',
				credit: 'Data sourced from',
				creditLink: 'pokopiawiki.com',
			};

	return (
		<div className="flex min-h-screen flex-col bg-[#f5f1e8] text-[#2f2419]">
			<header className="border-b border-[#d6c3a1] bg-[#fffdf8] px-6 py-8">
				<div className="mx-auto max-w-6xl">
					<h1 className="text-3xl font-black tracking-[0.2em]">{t.title}</h1>
				</div>
			</header>

			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
				<FlavorsTable rows={rows} locale={locale} />
			</main>

			<footer className="border-t border-[#d6c3a1] bg-[#fffdf8] px-6 py-6">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-[#7f6f5a]">
					<p>
						{t.credit}{' '}
						<a
							href={SOURCE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="font-bold text-[#2f2419] underline hover:text-[#5f4f3a]"
						>
							{t.creditLink}
						</a>
						.
					</p>
					<a
						href={SOURCE_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="font-bold uppercase tracking-widest hover:text-[#2f2419]"
					>
						{SOURCE_URL} ↗
					</a>
				</div>
			</footer>
		</div>
	);
}
