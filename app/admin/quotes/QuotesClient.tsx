"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400 bg-yellow-900/20 border-yellow-700/40",
  REVIEWED: "text-blue-400 bg-blue-900/20 border-blue-700/40",
  ACCEPTED: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  DECLINED: "text-red-400 bg-red-900/20 border-red-700/40",
};

const CONDITION_LABELS: Record<string, string> = {
  NM: "NM",
  LP: "LP",
  MP: "MP",
  HP: "HP",
  DMG: "DMG",
};

const VALID_STATUSES = ["PENDING", "REVIEWED", "ACCEPTED", "DECLINED"];

interface QuoteItem {
  id: string;
  quantity: number;
  condition: string;
  product: { name: string; setName: string; imageUrl: string | null };
}

interface Quote {
  id: string;
  status: string;
  totalCash: number | null;
  totalCredit: number | null;
  notes: string | null;
  guestEmail: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string } | null;
  items: QuoteItem[];
}

interface Props {
  initialQuotes: Quote[];
}

export function QuotesClient({ initialQuotes }: Props) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const updateStatus = async (quoteId: string, status: string) => {
    setUpdating(quoteId);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setQuotes((prev) =>
          prev.map((q) => (q.id === quoteId ? { ...q, status } : q))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="bg-cf-surface border border-cf-border rounded-xl p-10 text-center">
        <p className="text-cf-cream font-medium">No sell quotes yet</p>
        <p className="text-cf-cream-dark text-sm mt-1">
          Customer sell requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quotes.map((quote) => {
        const contactName = quote.user
          ? `${quote.user.firstName} ${quote.user.lastName}`
          : "Guest";
        const contactEmail = quote.user?.email ?? quote.guestEmail ?? "—";

        return (
          <div
            key={quote.id}
            className="bg-cf-surface border border-cf-border rounded-xl overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cf-cream text-sm font-medium">
                    #{quote.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-cf-cream-dark text-xs">{contactName}</span>
                  <span className="text-cf-cream-dark text-xs hidden sm:inline">
                    {contactEmail}
                  </span>
                </div>
                <p className="text-cf-cream-dark text-xs mt-0.5">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(quote.createdAt))}
                  {" · "}
                  {quote.items.length} card{quote.items.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Estimated totals */}
              <div className="text-right shrink-0">
                {quote.totalCash != null && (
                  <p className="text-cf-gold font-bold text-sm">
                    {formatPrice(quote.totalCash)} cash
                  </p>
                )}
                {quote.totalCredit != null && (
                  <p className="text-emerald-400 font-bold text-xs">
                    {formatPrice(quote.totalCredit)} credit
                  </p>
                )}
              </div>

              {/* Status selector */}
              <div className="relative shrink-0">
                <select
                  value={quote.status}
                  disabled={updating === quote.id}
                  onChange={(e) => updateStatus(quote.id, e.target.value)}
                  className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-lg border cursor-pointer outline-none transition-colors ${
                    STATUS_COLORS[quote.status] ?? "text-cf-cream-dark border-cf-border"
                  } ${updating === quote.id ? "opacity-50" : ""}`}
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
                  setExpanded((prev) => (prev === quote.id ? null : quote.id))
                }
                className="text-cf-cream-dark hover:text-cf-cream transition-colors shrink-0"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    expanded === quote.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Expanded items */}
            {expanded === quote.id && (
              <div className="border-t border-cf-border px-4 py-3 space-y-2 bg-cf-darker/40">
                {quote.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-cf-cream-dark">
                    <span className="truncate mr-4">
                      {item.product.name}
                      <span className="text-cf-cream-dark/60 ml-1">
                        — {item.product.setName}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {CONDITION_LABELS[item.condition] ?? item.condition} × {item.quantity}
                    </span>
                  </div>
                ))}
                {quote.notes && (
                  <p className="text-cf-cream-dark text-xs pt-2 border-t border-cf-border mt-2">
                    <span className="font-medium text-cf-cream">Notes:</span> {quote.notes}
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
