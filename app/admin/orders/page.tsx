import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrdersClient } from "./OrdersClient";

export const metadata: Metadata = { title: "Orders" };
export const revalidate = 0;

const PAGE_SIZE = 50;

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_COUNT_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  FULFILLED: "text-emerald-400",
  PAID: "text-blue-400",
  CANCELLED: "text-red-400",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const statusFilter =
    typeof searchParams.status === "string" ? searchParams.status : "";
  const page = Math.max(1, Number(searchParams.page ?? "1"));

  const where: Record<string, unknown> = {};
  if (statusFilter && ["PENDING", "PAID", "FULFILLED", "CANCELLED"].includes(statusFilter)) {
    where.status = statusFilter;
  }

  const [total, orders, statusCounts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count.id])
  );

  const mapped = orders.map((o) => ({
    ...o,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    // Ensure nullable fields are explicitly typed
    user: o.user ?? null,
    guestName: o.guestName ?? null,
    guestEmail: o.guestEmail ?? null,
    guestPhone: o.guestPhone ?? null,
    pickupNote: o.pickupNote ?? null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const makeHref = (p: number, s = statusFilter) => {
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl text-cf-cream">Orders</h1>
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

      <OrdersClient initialOrders={mapped} />

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
