import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Calendar,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const now = new Date();

  const [
    totalProducts,
    inStockProducts,
    lowStockProducts,
    featuredProducts,
    totalOrders,
    pendingOrders,
    recentOrders,
    upcomingEvents,
    pendingQuotes,
    totalRevenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { quantity: { gt: 0 } } }),
    prisma.product.count({ where: { quantity: { gt: 0, lte: 3 } } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
    prisma.event.count({ where: { isActive: true, date: { gte: now } } }),
    prisma.sellQuote.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "FULFILLED"] } },
      _sum: { total: true },
    }),
  ]);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts.toLocaleString(),
      sub: `${inStockProducts} in stock`,
      icon: Package,
      href: "/admin/products",
      accent: "text-blue-400",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      sub: `${pendingOrders} pending`,
      icon: ShoppingBag,
      href: "/admin/orders",
      accent: "text-cf-gold",
    },
    {
      label: "Upcoming Events",
      value: upcomingEvents.toLocaleString(),
      sub: "scheduled",
      icon: Calendar,
      href: "/admin/events",
      accent: "text-emerald-400",
    },
    {
      label: "Pending Quotes",
      value: pendingQuotes.toLocaleString(),
      sub: "sell quotes to review",
      icon: ClipboardList,
      href: "/admin/quotes",
      accent: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-cf-cream">Dashboard</h1>
        <p className="text-cf-cream-dark text-sm mt-0.5">CardFellas store overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-cf-surface border border-cf-border rounded-xl p-5 hover:border-cf-gold/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-cf-cream-dark text-xs uppercase tracking-wide">
                {s.label}
              </span>
              <s.icon size={16} className={s.accent} />
            </div>
            <p className={`font-display text-3xl ${s.accent}`}>{s.value}</p>
            <p className="text-cf-cream-dark text-xs mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-cf-surface border border-cf-border rounded-xl p-5">
          <h2 className="font-display text-xl text-cf-cream mb-4">Alerts</h2>
          <div className="space-y-3">
            {lowStockProducts > 0 ? (
              <Link
                href="/admin/products?filter=low_stock"
                className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg hover:border-yellow-600/50 transition-colors"
              >
                <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    {lowStockProducts} low-stock product{lowStockProducts !== 1 ? "s" : ""}
                  </p>
                  <p className="text-yellow-400/70 text-xs">3 or fewer remaining</p>
                </div>
              </Link>
            ) : (
              <p className="text-cf-cream-dark text-sm text-center py-4">
                No alerts — inventory looks good!
              </p>
            )}
            {pendingOrders > 0 && (
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 p-3 bg-cf-gold/10 border border-cf-gold/30 rounded-lg hover:border-cf-gold/50 transition-colors"
              >
                <ShoppingBag size={16} className="text-cf-gold shrink-0" />
                <div>
                  <p className="text-cf-gold text-sm font-medium">
                    {pendingOrders} order{pendingOrders !== 1 ? "s" : ""} awaiting fulfillment
                  </p>
                  <p className="text-cf-gold/70 text-xs">Needs action</p>
                </div>
              </Link>
            )}
            {pendingQuotes > 0 && (
              <Link
                href="/admin/quotes"
                className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg hover:border-purple-600/50 transition-colors"
              >
                <ClipboardList size={16} className="text-purple-400 shrink-0" />
                <div>
                  <p className="text-purple-300 text-sm font-medium">
                    {pendingQuotes} sell quote{pendingQuotes !== 1 ? "s" : ""} pending review
                  </p>
                  <p className="text-purple-400/70 text-xs">Customer sell requests</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-cf-surface border border-cf-border rounded-xl p-5">
          <h2 className="font-display text-xl text-cf-cream mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-cf-cream-dark">Total Revenue</span>
              <span className="text-cf-gold font-bold">
                {formatPrice(Number(totalRevenue._sum.total ?? 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cf-cream-dark">Featured Products</span>
              <span className="text-cf-cream">{featuredProducts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cf-cream-dark">Out of Stock</span>
              <span className={totalProducts - inStockProducts > 0 ? "text-red-400" : "text-cf-cream"}>
                {totalProducts - inStockProducts}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cf-cream-dark">Low Stock (&le; 3)</span>
              <span className={lowStockProducts > 0 ? "text-yellow-400" : "text-cf-cream"}>
                {lowStockProducts}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-cf-border">
            <h3 className="text-cf-cream-dark text-xs uppercase tracking-wide mb-3">
              Recent Orders
            </h3>
            {recentOrders.length === 0 ? (
              <p className="text-cf-cream-dark text-sm">No orders yet</p>
            ) : (
              <ul className="space-y-2">
                {recentOrders.map((o) => (
                  <li key={o.id} className="flex justify-between text-xs">
                    <span className="text-cf-cream-dark">
                      #{o.id.slice(-8).toUpperCase()} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-cf-gold">{formatPrice(Number(o.total))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-cf-surface border border-cf-border rounded-xl p-5">
        <h2 className="font-display text-xl text-cf-cream mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-cf-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Package size={14} /> Add Product
          </Link>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 bg-cf-gold text-cf-dark text-sm font-semibold px-4 py-2 rounded-lg hover:bg-cf-gold-light transition-colors"
          >
            <Calendar size={14} /> Add Event
          </Link>
          <Link
            href="/admin/products?filter=out_of_stock"
            className="flex items-center gap-2 border border-cf-border text-cf-cream-dark text-sm px-4 py-2 rounded-lg hover:border-cf-red hover:text-cf-red transition-colors"
          >
            <TrendingUp size={14} /> View Out-of-Stock
          </Link>
        </div>
      </div>
    </div>
  );
}
