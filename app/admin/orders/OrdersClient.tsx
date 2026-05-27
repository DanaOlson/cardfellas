"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-900/20 border-yellow-700/40",
  PAID: "text-blue-400 bg-blue-900/20 border-blue-700/40",
  FULFILLED: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  CANCELLED: "text-red-400 bg-red-900/20 border-red-700/40",
};

const VALID_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED"];

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  total: number;
  status: string;
  stripeId: string | null;
  pickupNote: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string } | null;
  items: OrderItem[];
}

interface Props {
  initialOrders: Order[];
}

export function OrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-cf-surface border border-cf-border rounded-xl p-10 text-center">
        <p className="text-cf-cream font-medium">No orders found</p>
        <p className="text-cf-cream-dark text-sm mt-1">
          Orders will appear here once customers check out.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const contactName = order.user
          ? `${order.user.firstName} ${order.user.lastName}`
          : (order.guestName ?? "Guest");
        const contactEmail = order.user?.email ?? order.guestEmail ?? "—";
        const isGuest = !order.user;

        return (
          <div
            key={order.id}
            className="bg-cf-surface border border-cf-border rounded-xl overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cf-cream text-sm font-medium">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                  {isGuest && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cf-border text-cf-cream-dark">
                      Guest
                    </span>
                  )}
                  <span className="text-cf-cream-dark text-xs">{contactName}</span>
                  <span className="text-cf-cream-dark text-xs hidden sm:inline">
                    {contactEmail}
                  </span>
                  {order.guestPhone && (
                    <span className="text-cf-cream-dark text-xs hidden md:inline">
                      {order.guestPhone}
                    </span>
                  )}
                </div>
                <p className="text-cf-cream-dark text-xs mt-0.5">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(order.createdAt))}
                  {" · "}
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              <span className="text-cf-gold font-bold text-sm shrink-0">
                {formatPrice(order.total)}
              </span>

              {/* Status selector */}
              <div className="relative shrink-0">
                <select
                  value={order.status}
                  disabled={updating === order.id}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-lg border cursor-pointer outline-none transition-colors ${
                    STATUS_COLORS[order.status] ?? "text-cf-cream-dark border-cf-border"
                  } ${updating === order.id ? "opacity-50" : ""}`}
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-cf-surface text-cf-cream">
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current"
                />
              </div>

              {/* Expand toggle */}
              <button
                onClick={() =>
                  setExpanded((prev) => (prev === order.id ? null : order.id))
                }
                className="text-cf-cream-dark hover:text-cf-cream transition-colors shrink-0"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expanded === order.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Expanded items */}
            {expanded === order.id && (
              <div className="border-t border-cf-border px-4 py-3 space-y-1.5 bg-cf-darker/40">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs text-cf-cream-dark"
                  >
                    <span className="truncate mr-4">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.pickupNote && (
                  <p className="text-cf-cream-dark text-xs pt-2 border-t border-cf-border mt-1">
                    <span className="font-medium text-cf-cream">Pickup note:</span>{" "}
                    {order.pickupNote}
                  </p>
                )}
                {order.stripeId && (
                  <p className="text-cf-cream-dark/60 text-xs pt-1 border-t border-cf-border mt-1">
                    Stripe: {order.stripeId}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
