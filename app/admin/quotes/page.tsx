import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { QuotesClient } from "./QuotesClient";

export const metadata: Metadata = { title: "Sell Quotes" };
export const revalidate = 0;

const PAGE_SIZE = 50;

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
];

const STATUS_COUNT_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  REVIEWED: "text-blue-400",
  ACCEPTED: "text-emerald-400",
  DECLINED: "text-red-400",
};

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const statusFilter =
    typeof searchParams.status === "string" ? searchParams.status : "";
  const page = Math.max(1, Number(searchParams.page ?? "1"));

  const where: Record<string, unknown> = {};
  if (
    statusFilter &&
    ["PENDING", "REVIEWED", "ACCEPTED", "DECLINED"].includes(statusFilter)
  ) {
    where.status = statusFilter;
  }

  const [total, quotes, statusCounts] = await Promise.all([
    prisma.sellQuote.count({ where }),
    prisma.sellQuote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, setName: true, imageUrl: true } },
          },
        },
      },
    }),
    prisma.sellQuote.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  );

  const mapped = quotes.map((q) => ({
    ...q,
    totalCash: q.totalCash ? Number(q.totalCash) : null,
    totalCredit: q.totalCredit ? Number(q.totalCredit) : null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const makeHref = (p: number, s = statusFilter) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/quotes${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl text-cf-cream">Sell Quotes</h1>
        <p className="text-cf-cream-dark text-sm">{total.toLocaleString()} total</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_TABS.map((t) => {
          const count = t.value ? countByStatus[t.value] ?? 0 : total;
          return (
            <Link
              key={t.value}
              href={makeHref(1, t.value)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === t.value
                  ? "bg-cf-red border-cf-red text-white"
                  : "border-cf-border text-cf-cream-dark hover:border-cf-red hover:text-cf-red"
              }`}
            >
              {t.label}
              <span
                className={`font-bold ${
                  statusFilter === t.value
                    ? "text-white"
                    : (STATUS_COUNT_COLORS[t.value] ?? "text-cf-cream-dark")
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      <QuotesClient initialQuotes={mapped} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
