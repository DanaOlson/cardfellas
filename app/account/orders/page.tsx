import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order History" };

const PAGE_SIZE = 20;

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  PAID: "text-blue-400",
  FULFILLED: "text-emerald-400",
  CANCELLED: "text-red-400",
};

export default async function AllOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const userId = session.user.id;

  const [total, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const makeHref = (p: number) =>
    p === 1 ? "/account/orders" : `/account/orders?page=${p}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/account"
          className="text-cf-cream-dark hover:text-cf-cream transition-colors"
          aria-label="Back to account"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-cf-gold" />
          <h1 className="font-display text-3xl text-cf-cream">Order History</h1>
          <span className="text-lg text-cf-gold">{total}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-cf-surface border border-cf-border rounded-xl p-10 text-center">
          <p className="text-cf-cream font-medium">No orders yet</p>
          <Link href="/shop" className="inline-block mt-3 text-sm text-cf-gold hover:underline">
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-cf-surface border border-cf-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-cf-cream text-sm font-medium">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-cf-cream-dark text-xs">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-cf-gold font-bold text-sm">
                    {formatPrice(Number(order.total))}
                  </p>
                  <p className={`text-xs font-medium ${ORDER_STATUS_COLORS[order.status] ?? "text-cf-cream-dark"}`}>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-cf-cream-dark">
                    <span className="truncate mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
