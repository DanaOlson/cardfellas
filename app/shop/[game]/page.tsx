import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { slugToGame, formatGame } from "@/lib/utils";
import { ProductCard } from "@/components/shop/ProductCard";
import { FiltersSidebar } from "@/components/shop/FiltersSidebar";
import { SortSelect } from "@/components/shop/SortSelect";
import { AppliedFilters } from "@/components/shop/AppliedFilters";
import { MobileFilterButton } from "@/components/shop/MobileFilterButton";
import { Prisma } from "@prisma/client";

const VALID_GAMES = ["magic", "pokemon", "yugioh", "sports", "other"];
const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
}: {
  params: { game: string };
}): Promise<Metadata> {
  if (!VALID_GAMES.includes(params.game)) return {};
  const label = formatGame(slugToGame(params.game));
  return {
    title: label,
    description: `Shop ${label} singles at CardFellas — Layton, UT's premier TCG store.`,
  };
}

function parseSearchParams(sp: Record<string, string | string[] | undefined>) {
  const arr = (key: string): string[] => {
    const v = sp[key];
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };
  const str = (key: string) => {
    const v = sp[key];
    return typeof v === "string" ? v : undefined;
  };
  return {
    q: str("q") ?? "",
    conditions: arr("condition"),
    sets: arr("set"),
    rarities: arr("rarity"),
    colors: arr("color"),
    foil: str("foil"),
    inStock: str("inStock") === "true",
    minPrice: str("minPrice"),
    maxPrice: str("maxPrice"),
    sort: str("sort") ?? "newest",
    page: Math.max(1, Number(str("page") ?? "1")),
  };
}

export default async function GameShopPage({
  params,
  searchParams,
}: {
  params: { game: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!VALID_GAMES.includes(params.game)) notFound();

  const game = slugToGame(params.game);
  const gameLabel = formatGame(game);
  const filters = parseSearchParams(searchParams);

  // Build where clause
  const where: Prisma.ProductWhereInput = { game: game as Prisma.EnumGameFilter["equals"] };
  if (filters.conditions.length)
    where.condition = { in: filters.conditions as Prisma.EnumConditionFilter["in"] };
  if (filters.sets.length) where.setName = { in: filters.sets };
  if (filters.rarities.length) where.rarity = { in: filters.rarities };
  if (filters.foil === "true") where.isFoil = true;
  if (filters.foil === "false") where.isFoil = false;
  if (filters.inStock) where.quantity = { gt: 0 };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice)
      (where.price as Prisma.DecimalFilter).gte = Number(filters.minPrice);
    if (filters.maxPrice)
      (where.price as Prisma.DecimalFilter).lte = Number(filters.maxPrice);
  }
  // Collect AND-composable sub-conditions so q and colors can coexist
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    andConditions.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { setName: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }
  if (filters.colors.length) {
    // colorIdentity stores comma-separated codes, e.g. "W,U" — match any selected color
    andConditions.push({
      OR: filters.colors.map((c) => ({ colorIdentity: { contains: c } })),
    });
  }
  if (andConditions.length === 1) {
    Object.assign(where, andConditions[0]);
  } else if (andConditions.length > 1) {
    where.AND = andConditions;
  }

  // Fetch sets, rarities, and products in parallel
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price_asc"
      ? { price: "asc" }
      : filters.sort === "price_desc"
      ? { price: "desc" }
      : filters.sort === "name_asc"
      ? { name: "asc" }
      : { createdAt: "desc" };

  const [setsRaw, raritiesRaw, total, products] = await Promise.all([
    prisma.product.findMany({
      where: { game: game as Prisma.EnumGameFilter["equals"] },
      select: { setName: true, setCode: true },
      distinct: ["setName"],
      orderBy: { setName: "asc" },
    }),
    prisma.product.findMany({
      where: { game: game as Prisma.EnumGameFilter["equals"], rarity: { not: null } },
      select: { rarity: true },
      distinct: ["rarity"],
      orderBy: { rarity: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (filters.page - 1) * PAGE_SIZE,
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

  const sets = setsRaw.map((s) => ({ name: s.setName, code: s.setCode }));
  const rarities = raritiesRaw
    .map((r) => r.rarity)
    .filter(Boolean) as string[];
  const productsMapped = products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-4xl sm:text-5xl text-cf-cream">
          {gameLabel}
        </h1>
        <p className="text-cf-cream-dark text-sm mt-1">
          {total.toLocaleString()} card{total !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Filter sidebar — desktop inline, mobile drawer */}
        <Suspense fallback={null}>
          <FiltersSidebar sets={sets} rarities={rarities} game={game} />
        </Suspense>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <MobileFilterButton sets={sets} rarities={rarities} game={game} />
              <span className="text-cf-cream-dark text-sm hidden sm:block">
                {total > 0
                  ? `Showing ${(filters.page - 1) * PAGE_SIZE + 1}–${Math.min(
                      filters.page * PAGE_SIZE,
                      total
                    )} of ${total.toLocaleString()}`
                  : "No results"}
              </span>
            </div>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          {/* Applied filter chips */}
          <Suspense fallback={null}>
            <AppliedFilters />
          </Suspense>

          {/* Product grid */}
          {productsMapped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-cf-border rounded-xl">
              <span className="text-5xl">🃏</span>
              <div>
                <p className="text-cf-cream font-medium text-lg">
                  No cards found
                </p>
                <p className="text-cf-cream-dark text-sm mt-1">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {productsMapped.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Suspense fallback={null}>
              <Pagination
                page={filters.page}
                totalPages={totalPages}
                searchParams={searchParams}
                pathname={`/shop/${params.game}`}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
  pathname,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
  pathname: string;
}) {
  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page") continue;
      if (Array.isArray(v)) v.forEach((val) => params.append(k, val));
      else if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  for (
    let i = Math.max(1, page - 2);
    i <= Math.min(totalPages, page + 2);
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {page > 1 && (
        <a
          href={makeHref(page - 1)}
          className="px-3 py-1.5 rounded border border-cf-border text-cf-cream-dark text-sm hover:border-cf-red hover:text-cf-cream transition-colors"
        >
          ← Prev
        </a>
      )}
      {pages.map((p) => (
        <a
          key={p}
          href={makeHref(p)}
          className={`px-3 py-1.5 rounded border text-sm transition-colors ${
            p === page
              ? "bg-cf-red border-cf-red text-white"
              : "border-cf-border text-cf-cream-dark hover:border-cf-red hover:text-cf-cream"
          }`}
        >
          {p}
        </a>
      ))}
      {page < totalPages && (
        <a
          href={makeHref(page + 1)}
          className="px-3 py-1.5 rounded border border-cf-border text-cf-cream-dark text-sm hover:border-cf-red hover:text-cf-cream transition-colors"
        >
          Next →
        </a>
      )}
    </div>
  );
}
