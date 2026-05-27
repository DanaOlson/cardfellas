import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ProductCard } from "@/components/shop/ProductCard";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse our selection of Magic: The Gathering, Pokémon, Yu-Gi-Oh!, sports cards, and more.",
};

const categories = [
  {
    game: "magic",
    label: "Magic: The Gathering",
    shortLabel: "MTG",
    description: "Standard, Modern, Commander, Draft — singles and sealed.",
    color: "from-blue-900/80 to-cf-darker",
    border: "border-blue-700/40 hover:border-blue-500",
    badge: "bg-blue-900/60 text-blue-300",
    emoji: "⚔️",
  },
  {
    game: "pokemon",
    label: "Pokémon TCG",
    shortLabel: "Pokémon",
    description: "Vintage Base Set to the latest Scarlet & Violet sets.",
    color: "from-yellow-900/60 to-cf-darker",
    border: "border-yellow-700/40 hover:border-yellow-500",
    badge: "bg-yellow-900/60 text-yellow-300",
    emoji: "⚡",
  },
  {
    game: "yugioh",
    label: "Yu-Gi-Oh!",
    shortLabel: "YGO",
    description: "Old school to modern meta. LOB to the latest sets.",
    color: "from-purple-900/60 to-cf-darker",
    border: "border-purple-700/40 hover:border-purple-500",
    badge: "bg-purple-900/60 text-purple-300",
    emoji: "👁️",
  },
  {
    game: "sports",
    label: "Sports Cards",
    shortLabel: "Sports",
    description: "Baseball, basketball, football, and more. Rookies to legends.",
    color: "from-green-900/60 to-cf-darker",
    border: "border-green-700/40 hover:border-green-500",
    badge: "bg-green-900/60 text-green-300",
    emoji: "🏆",
  },
  {
    game: "other",
    label: "Other Games",
    shortLabel: "Other",
    description: "Board games, accessories, sleeves, and more.",
    color: "from-cf-border/60 to-cf-darker",
    border: "border-cf-border hover:border-cf-cream-dark/40",
    badge: "bg-cf-surface text-cf-cream-dark",
    emoji: "🎲",
  },
];

const PAGE_SIZE = 48;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page ?? "1"));

  // When there's a search query, show cross-game results instead of category tiles
  if (q) {
    const where: Prisma.ProductWhereInput = {
      quantity: { gt: 0 },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { setName: { contains: q, mode: "insensitive" } },
      ],
    };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          game: true,
          setName: true,
          condition: true,
          price: true,
          quantity: true,
          isFoil: true,
          rarity: true,
          imageUrl: true,
        },
      }),
    ]);

    const mapped = products.map((p) => ({ ...p, price: Number(p.price) }));
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const makeHref = (p: number) => {
      const params = new URLSearchParams({ q });
      if (p > 1) params.set("page", String(p));
      return `/shop?${params.toString()}`;
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-4xl text-cf-cream">
              Search Results
            </h1>
            <p className="text-cf-cream-dark text-sm mt-1">
              {total.toLocaleString()} result{total !== 1 ? "s" : ""} for &ldquo;
              <span className="text-cf-cream">{q}</span>&rdquo;
            </p>
          </div>
          <Link
            href="/shop"
            className="ml-auto text-sm text-cf-cream-dark hover:text-cf-red transition-colors"
          >
            ← Browse by game
          </Link>
        </div>

        {mapped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-cf-border rounded-xl">
            <span className="text-5xl">🃏</span>
            <div>
              <p className="text-cf-cream font-medium text-lg">No results found</p>
              <p className="text-cf-cream-dark text-sm mt-1">
                Try a different search term, or{" "}
                <Link href="/shop" className="text-cf-gold hover:underline">
                  browse by game
                </Link>
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {mapped.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {page > 1 && (
              <a
                href={makeHref(page - 1)}
                className="px-3 py-1.5 rounded border border-cf-border text-cf-cream-dark text-sm hover:border-cf-red transition-colors"
              >
                ← Prev
              </a>
            )}
            <span className="text-cf-cream-dark text-sm">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <a
                href={makeHref(page + 1)}
                className="px-3 py-1.5 rounded border border-cf-border text-cf-cream-dark text-sm hover:border-cf-red transition-colors"
              >
                Next →
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default: category tiles
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-5xl sm:text-6xl text-cf-cream mb-2">
          Shop
        </h1>
        <p className="text-cf-cream-dark text-lg">
          Browse our inventory by game or use the search above to find specific
          cards.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.game}
            href={`/shop/${cat.game}`}
            className={`group relative bg-gradient-to-br ${cat.color} border ${cat.border} rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${cat.badge} mb-2`}
                >
                  {cat.shortLabel}
                </span>
                <h2 className="font-display text-2xl text-cf-cream leading-tight">
                  {cat.label}
                </h2>
              </div>
              <span className="text-4xl" aria-hidden>
                {cat.emoji}
              </span>
            </div>

            <p className="text-cf-cream-dark text-sm leading-relaxed mb-4">
              {cat.description}
            </p>

            <div className="flex items-center gap-1.5 text-cf-cream text-sm font-medium group-hover:text-cf-gold transition-colors">
              Browse {cat.shortLabel}
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 bg-cf-surface border border-cf-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div>
          <h3 className="font-display text-2xl text-cf-cream">
            Looking for something specific?
          </h3>
          <p className="text-cf-cream-dark text-sm mt-1">
            Use the search bar to find any card by name, set, or game.
          </p>
        </div>
        <Link
          href="/sell"
          className="shrink-0 inline-flex items-center gap-2 bg-cf-gold text-cf-dark font-semibold px-5 py-2.5 rounded-lg hover:bg-cf-gold-light transition-colors"
        >
          Sell Your Cards <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
