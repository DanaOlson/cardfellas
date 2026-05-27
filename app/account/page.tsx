import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { User, ShoppingBag } from "lucide-react";
import { SignOutButton } from "./SignOutButton";
import { WishlistSection } from "./WishlistSection";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your CardFellas account, view orders, and your wishlist.",
};

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

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [user, orders, totalOrders, wishlist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: {
          include: {
            product: { select: { name: true, imageUrl: true } },
          },
        },
      },
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            game: true,
            setName: true,
            condition: true,
            price: true,
            quantity: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { id: "desc" },
      take: 50,
    }),
  ]);

  if (!user) redirect("/login");


  const joinedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Profile header */}
      <div className="bg-cf-surface border border-cf-border rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-cf-gold/20 border border-cf-gold/40 flex items-center justify-center">
            <User size={24} className="text-cf-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-cf-cream">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-cf-cream-dark text-sm">{user.email}</p>
            <p className="text-cf-cream-dark text-xs mt-0.5">Member since {joinedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "ADMIN" && (
            <a
              href="/admin"
              className="text-xs px-3 py-1.5 bg-cf-gold/10 border border-cf-gold/40 text-cf-gold rounded-lg hover:bg-cf-gold/20 transition-colors"
            >
              Admin Dashboard
            </a>
          )}
          <SignOutButton />
        </div>
      </div>

      {/* Orders */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-cf-gold" />
            <h2 className="font-display text-2xl text-cf-cream">Order History</h2>
            {totalOrders > 0 && (
              <span className="text-base text-cf-gold">{totalOrders}</span>
            )}
          </div>
          {totalOrders > 5 && (
            <a href="/account/orders" className="text-xs text-cf-gold hover:underline">
              View all →
            </a>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-cf-surface border border-cf-border rounded-xl p-8 text-center">
            <p className="text-cf-cream font-medium">No orders yet</p>
            <p className="text-cf-cream-dark text-sm mt-1">
              Your order history will appear here once you make a purchase.
            </p>
            <a
              href="/shop"
              className="inline-block mt-4 text-sm text-cf-gold hover:underline"
            >
              Browse the shop →
            </a>
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
                      <span className="shrink-0">{formatPrice(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <WishlistSection
        initialItems={wishlist.map((i) => ({
          id: i.id,
          product: { ...i.product, price: Number(i.product.price) },
        }))}
      />
    </div>
  );
}
