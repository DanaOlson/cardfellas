import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Search } from "lucide-react";
import { ProductsTable } from "./ProductsTable";

export const metadata: Metadata = { title: "Products" };
export const revalidate = 0;

const PAGE_SIZE = 50;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const filter = typeof searchParams.filter === "string" ? searchParams.filter : "";

  const where: Record<string, unknown> = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (filter === "out_of_stock") where.quantity = 0;
  if (filter === "low_stock") where.quantity = { gt: 0, lte: 3 };
  if (filter === "featured") where.isFeatured = true;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
        isFeatured: true,
        isBuylistFeatured: true,
        buyCashPrice: true,
      },
    }),
  ]);

  const mapped = products.map((p) => ({
    ...p,
    price: Number(p.price),
    buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter) params.set("filter", filter);
    params.set("page", String(p));
    return `/admin/products?${params.toString()}`;
  };

  const FILTER_TABS = [
    { value: "", label: "All" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "low_stock", label: "Low Stock" },
    { value: "featured", label: "Featured" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-cf-cream">Products</h1>
          <p className="text-cf-cream-dark text-sm">{total.toLocaleString()} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 bg-cf-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shrink-0"
        >
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 flex items-center gap-2 bg-cf-surface border border-cf-border rounded-lg px-3 py-2 focus-within:border-cf-gold transition-colors">
          <Search size={14} className="text-cf-cream-dark shrink-0" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name…"
            className="flex-1 bg-transparent text-cf-cream placeholder-cf-cream-dark text-sm outline-none"
          />
          {filter && <input type="hidden" name="filter" value={filter} />}
        </form>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map((t) => (
            <Link
              key={t.value}
              href={`/admin/products${t.value ? `?filter=${t.value}` : ""}`}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === t.value
                  ? "bg-cf-red border-cf-red text-white"
                  : "border-cf-border text-cf-cream-dark hover:border-cf-red hover:text-cf-red"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <ProductsTable products={mapped} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <a href={makeHref(page - 1)} className="px-3 py-1.5 rounded border border-cf-border text-cf-cream-dark text-sm hover:border-cf-red transition-colors">
              ← Prev
            </a>
          )}
          <span className="text-cf-cream-dark text-sm">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a href={makeHref(page + 1)} className="px-3 py-1.5 rounded border border-cf-border text-cf-cream-dark text-sm hover:border-cf-red transition-colors">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
