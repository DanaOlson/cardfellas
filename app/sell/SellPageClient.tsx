"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  X,
  ShoppingBag,
  MapPin,
  Clock,
  ChevronDown,
  Trash2,
  Send,
} from "lucide-react";
import { BuylistCard, BuylistCardData } from "@/components/sell/BuylistCard";
import { formatPrice } from "@/lib/utils";

const GAME_FILTERS = [
  { value: "", label: "All Games" },
  { value: "MAGIC", label: "MTG" },
  { value: "POKEMON", label: "Pokémon" },
  { value: "YUGIOH", label: "Yu-Gi-Oh!" },
  { value: "SPORTS", label: "Sports" },
  { value: "OTHER", label: "Other" },
];

interface SellPageClientProps {
  initialProducts: BuylistCardData[];
  sets?: { name: string; code: string | null }[];
}

export function SellPageClient({ initialProducts, sets = [] }: SellPageClientProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [products, setProducts] = useState<BuylistCardData[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [game, setGame] = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [sellCart, setSellCart] = useState<BuylistCardData[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteRef, setQuoteRef] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(
    async (query: string, gameFilter: string, set: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (gameFilter) params.set("game", gameFilter);
        if (set) params.set("set", set);
        params.set("limit", "48");
        const res = await fetch(`/api/buylist?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetchProducts(q, game, setFilter),
      300
    );
  }, [q, game, setFilter, fetchProducts]);

  const toggleSellCart = (product: BuylistCardData) => {
    setSellCart((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const inSellCart = (id: string) => sellCart.some((p) => p.id === id);

  const totalCash = sellCart.reduce((s, p) => s + (p.buyCashPrice ?? 0), 0);
  const totalCredit = sellCart.reduce((s, p) => s + (p.buyCreditPrice ?? 0), 0);

  const handleSubmit = async () => {
    if (!isLoggedIn && !guestEmail) {
      setSubmitError("Please enter your email so we can follow up on your quote.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/sell-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: sellCart.map((p) => ({
            productId: p.id,
            quantity: 1,
            condition: p.condition,
          })),
          ...(!isLoggedIn && guestEmail ? { guestEmail } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setQuoteRef(data.ref ?? "");
      setSubmitted(true);
      setSellCart([]);
      setCartOpen(false);
      setGuestEmail("");
    } catch {
      setSubmitError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-8 bg-gradient-to-br from-cf-gold/10 to-cf-darker border border-cf-gold/20 rounded-xl p-6 sm:p-8">
        <h1 className="font-display text-4xl sm:text-5xl text-cf-cream mb-2">
          Sell Your Cards
        </h1>
        <p className="text-cf-cream-dark text-base max-w-xl mb-6">
          We buy Magic, Pokémon, Yu-Gi-Oh!, sports cards, and more. Browse our
          buylist below to see what we&rsquo;re paying, then bring your cards in
          for an instant quote.
        </p>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              icon: <Search size={20} className="text-cf-gold" />,
              title: "Browse the Buylist",
              desc: "Find cards we're actively buying and see cash or credit prices.",
            },
            {
              step: "2",
              icon: <ShoppingBag size={20} className="text-cf-gold" />,
              title: "Add to Sell List",
              desc: "Select the cards you have and build your sell list.",
            },
            {
              step: "3",
              icon: <MapPin size={20} className="text-cf-gold" />,
              title: "Bring Cards In",
              desc: "Bring your cards to 1596 N Hill Field Rd, Suite B, Layton, UT.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="flex gap-3 bg-cf-surface/60 border border-cf-border rounded-lg p-3"
            >
              <div className="w-7 h-7 rounded-full bg-cf-gold/20 border border-cf-gold/40 flex items-center justify-center text-cf-gold text-xs font-bold shrink-0">
                {s.step}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  {s.icon}
                  <span className="text-cf-cream font-medium text-sm">
                    {s.title}
                  </span>
                </div>
                <p className="text-cf-cream-dark text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Hours note */}
        <div className="mt-4 flex items-center gap-2 text-cf-cream-dark text-xs">
          <Clock size={13} />
          <span>
            Quotes processed within 1 business day. Walk-ins welcome during
            store hours.
          </span>
        </div>
      </div>

      {/* Success state */}
      {submitted && (
        <div className="mb-6 bg-emerald-900/30 border border-emerald-600/40 rounded-xl p-5 text-center">
          <p className="text-emerald-300 font-medium text-lg mb-1">
            Sell list submitted!
          </p>
          {quoteRef && (
            <p className="text-emerald-400/80 text-xs font-mono mb-1">
              Reference #{quoteRef}
            </p>
          )}
          <p className="text-emerald-200/70 text-sm">
            Bring your cards in-store and we&rsquo;ll process your quote.
          </p>
          <button
            onClick={() => { setSubmitted(false); setQuoteRef(""); }}
            className="mt-3 text-xs text-emerald-400 underline"
          >
            Start a new list
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-cf-surface border border-cf-border rounded-lg px-3 py-2.5 focus-within:border-cf-gold transition-colors">
          <Search size={15} className="text-cf-cream-dark shrink-0" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search card name or set..."
            className="flex-1 bg-transparent text-cf-cream placeholder-cf-cream-dark text-sm outline-none min-w-0"
          />
          {q && (
            <button onClick={() => setQ("")}>
              <X size={14} className="text-cf-cream-dark hover:text-cf-cream" />
            </button>
          )}
        </div>

        {/* Game filter */}
        <div className="flex items-center gap-2 bg-cf-surface border border-cf-border rounded-lg px-3 py-2.5">
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="bg-transparent text-cf-cream text-sm outline-none cursor-pointer"
          >
            {GAME_FILTERS.map((g) => (
              <option key={g.value} value={g.value} className="bg-cf-surface">
                {g.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className="text-cf-cream-dark" />
        </div>

        {/* Set filter — only shown when sets are available */}
        {sets.length > 0 && (
          <div className="flex items-center gap-2 bg-cf-surface border border-cf-border rounded-lg px-3 py-2.5">
            <select
              value={setFilter}
              onChange={(e) => setSetFilter(e.target.value)}
              className="bg-transparent text-cf-cream text-sm outline-none cursor-pointer max-w-[160px]"
            >
              <option value="" className="bg-cf-surface">
                All Sets
              </option>
              {sets.map((s) => (
                <option key={s.name} value={s.name} className="bg-cf-surface">
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="text-cf-cream-dark" />
          </div>
        )}

        {/* Sell cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-cf-gold text-cf-dark font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-cf-gold-light transition-colors shrink-0"
        >
          <ShoppingBag size={16} />
          My Sell List
          {sellCart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-cf-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {sellCart.length}
            </span>
          )}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-cf-cream-dark">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Loading buylist...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-cf-border rounded-xl">
          <p className="text-cf-cream font-medium text-lg">
            No buylist items found
          </p>
          <p className="text-cf-cream-dark text-sm mt-1">
            Try adjusting your search or check back later as we update our
            buylist regularly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <BuylistCard
              key={p.id}
              product={p}
              inSellCart={inSellCart(p.id)}
              onToggle={toggleSellCart}
            />
          ))}
        </div>
      )}

      {/* Sell Cart Drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setCartOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-cf-surface border-l border-cf-border flex flex-col animate-slide-in shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-cf-border">
              <div>
                <h2 className="font-display text-2xl text-cf-cream">
                  My Sell List
                </h2>
                <p className="text-cf-cream-dark text-xs">
                  {sellCart.length} card{sellCart.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={() => setCartOpen(false)}>
                <X size={20} className="text-cf-cream-dark hover:text-cf-cream" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
              {sellCart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <ShoppingBag size={40} className="text-cf-border" />
                  <p className="text-cf-cream-dark text-sm">
                    Add cards from the buylist to build your sell list
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {sellCart.map((p) => (
                    <li
                      key={p.id}
                      className="flex gap-2 pb-3 border-b border-cf-border last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-cf-cream text-sm font-medium truncate">
                          {p.name}
                        </p>
                        <p className="text-cf-cream-dark text-xs">
                          {p.setName} · {p.condition}
                        </p>
                        <div className="flex gap-3 mt-1">
                          {p.buyCashPrice && (
                            <span className="text-cf-gold text-sm font-bold">
                              {formatPrice(p.buyCashPrice)} cash
                            </span>
                          )}
                          {p.buyCreditPrice && (
                            <span className="text-emerald-400 text-sm font-bold">
                              {formatPrice(p.buyCreditPrice)} credit
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSellCart(p)}
                        className="text-cf-cream-dark hover:text-cf-red transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {sellCart.length > 0 && (
              <div className="border-t border-cf-border px-5 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cf-cream-dark">Estimated Cash</span>
                  <span className="text-cf-gold font-bold">
                    {formatPrice(totalCash)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cf-cream-dark">Estimated Credit</span>
                  <span className="text-emerald-400 font-bold">
                    {formatPrice(totalCredit)}
                  </span>
                </div>
                <p className="text-xs text-cf-cream-dark">
                  Final prices subject to card condition verification in-store.
                </p>

                {/* Guest email — only shown when not logged in */}
                {!isLoggedIn && (
                  <div>
                    <label className="block text-cf-cream-dark text-xs mb-1.5">
                      Your email{" "}
                      <span className="text-cf-cream-dark/60">(so we can reach you)</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => {
                        setGuestEmail(e.target.value);
                        if (submitError) setSubmitError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
                    />
                  </div>
                )}

                {submitError && (
                  <p className="text-red-400 text-xs bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
                    {submitError}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-cf-gold text-cf-dark font-bold py-3 rounded-lg hover:bg-cf-gold-light transition-colors disabled:opacity-60"
                >
                  <Send size={15} />{" "}
                  {submitting ? "Submitting…" : "Submit Sell List"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
