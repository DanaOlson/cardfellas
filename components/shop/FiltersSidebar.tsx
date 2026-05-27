"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterSet = { name: string; code: string | null };

interface FiltersSidebarProps {
  sets: FilterSet[];
  rarities: string[];
  game: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"] as const;
const MTG_COLORS = [
  { code: "W", label: "White", symbol: "☀" },
  { code: "U", label: "Blue", symbol: "💧" },
  { code: "B", label: "Black", symbol: "💀" },
  { code: "R", label: "Red", symbol: "🔥" },
  { code: "G", label: "Green", symbol: "🌲" },
  { code: "C", label: "Colorless", symbol: "◇" },
  { code: "M", label: "Multi", symbol: "✦" },
];

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-cf-border last:border-0 py-3">
      <button
        className="flex items-center justify-between w-full text-left mb-2"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-cf-cream-dark">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-cf-cream-dark" />
        ) : (
          <ChevronDown size={14} className="text-cf-cream-dark" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export function FiltersSidebar({
  sets,
  rarities,
  game,
  isMobileOpen,
  onMobileClose,
}: FiltersSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localQ, setLocalQ] = useState(searchParams.get("q") ?? "");
  const [setSearch, setSetSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConditions = searchParams.getAll("condition");
  const activeSets = searchParams.getAll("set");
  const activeRarities = searchParams.getAll("rarity");
  const activeColors = searchParams.getAll("color");
  const activeFoil = searchParams.get("foil");
  const activeInStock = searchParams.get("inStock") === "true";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";

  const push = useCallback(
    (params: URLSearchParams) => {
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (!value) p.delete(key);
    else p.set(key, value);
    push(p);
  };

  const toggleArray = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    const existing = p.getAll(key);
    p.delete(key);
    if (existing.includes(value)) {
      existing.filter((v) => v !== value).forEach((v) => p.append(key, v));
    } else {
      [...existing, value].forEach((v) => p.append(key, v));
    }
    push(p);
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (localQ) p.set("q", localQ);
      else p.delete("q");
      push(p);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localQ]);

  const clearAll = () => {
    setLocalQ("");
    router.replace(pathname, { scroll: false });
    onMobileClose?.();
  };

  const hasFilters =
    activeConditions.length > 0 ||
    activeSets.length > 0 ||
    activeRarities.length > 0 ||
    activeColors.length > 0 ||
    activeFoil !== null ||
    activeInStock ||
    activeMinPrice ||
    activeMaxPrice ||
    localQ;

  const filteredSets = sets.filter((s) =>
    s.name.toLowerCase().includes(setSearch.toLowerCase())
  );

  const sidebar = (
    <div className="text-sm space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cf-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-cf-cream-dark" />
          <span className="font-display text-lg text-cf-cream tracking-wide">
            Filters
          </span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-cf-red hover:text-cf-red-light flex items-center gap-1"
          >
            <X size={12} /> Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <Section title="Search">
        <div className="flex items-center gap-2 bg-cf-darker border border-cf-border rounded px-2.5 py-1.5 focus-within:border-cf-red transition-colors">
          <Search size={13} className="text-cf-cream-dark shrink-0" />
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Card name, set..."
            className="flex-1 bg-transparent text-cf-cream placeholder-cf-cream-dark text-xs outline-none"
          />
          {localQ && (
            <button onClick={() => setLocalQ("")}>
              <X size={12} className="text-cf-cream-dark hover:text-cf-cream" />
            </button>
          )}
        </div>
      </Section>

      {/* Condition */}
      <Section title="Condition">
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              onClick={() => toggleArray("condition", c)}
              className={cn(
                "px-2.5 py-1 rounded text-xs border transition-colors",
                activeConditions.includes(c)
                  ? "bg-cf-red border-cf-red text-white"
                  : "bg-transparent border-cf-border text-cf-cream-dark hover:border-cf-cream-dark"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Section>

      {/* Foil */}
      <Section title="Foil / Variant" defaultOpen={false}>
        <div className="flex gap-2">
          {[
            { v: "false", label: "Normal" },
            { v: "true", label: "Foil" },
          ].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setParam("foil", activeFoil === v ? null : v)}
              className={cn(
                "px-2.5 py-1 rounded text-xs border transition-colors flex-1",
                activeFoil === v
                  ? "bg-cf-gold border-cf-gold text-cf-dark font-semibold"
                  : "bg-transparent border-cf-border text-cf-cream-dark hover:border-cf-cream-dark"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* MTG Color */}
      {game === "MAGIC" && (
        <Section title="Color" defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {MTG_COLORS.map(({ code, label, symbol }) => (
              <button
                key={code}
                title={label}
                onClick={() => toggleArray("color", code)}
                className={cn(
                  "w-8 h-8 rounded text-base border transition-colors flex items-center justify-center",
                  activeColors.includes(code)
                    ? "bg-cf-red border-cf-red"
                    : "bg-transparent border-cf-border hover:border-cf-cream-dark"
                )}
              >
                {symbol}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Rarity */}
      {rarities.length > 0 && (
        <Section title="Rarity" defaultOpen={false}>
          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
            {rarities.map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activeRarities.includes(r)}
                  onChange={() => toggleArray("rarity", r)}
                  className="accent-cf-red w-3.5 h-3.5 rounded"
                />
                <span className="text-xs text-cf-cream-dark group-hover:text-cf-cream transition-colors">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Set */}
      {sets.length > 0 && (
        <Section title="Set / Expansion" defaultOpen={false}>
          {sets.length > 6 && (
            <div className="flex items-center gap-1.5 bg-cf-darker border border-cf-border rounded px-2 py-1 mb-2 focus-within:border-cf-red transition-colors">
              <Search size={11} className="text-cf-cream-dark shrink-0" />
              <input
                type="text"
                value={setSearch}
                onChange={(e) => setSetSearch(e.target.value)}
                placeholder="Filter sets..."
                className="flex-1 bg-transparent text-cf-cream placeholder-cf-cream-dark text-xs outline-none"
              />
            </div>
          )}
          <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {filteredSets.map((s) => (
              <label key={s.name} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={activeSets.includes(s.name)}
                  onChange={() => toggleArray("set", s.name)}
                  className="accent-cf-red w-3.5 h-3.5 rounded shrink-0"
                />
                <span className="text-xs text-cf-cream-dark group-hover:text-cf-cream transition-colors leading-tight">
                  {s.name}
                  {s.code && (
                    <span className="ml-1 text-cf-border">[{s.code}]</span>
                  )}
                </span>
              </label>
            ))}
            {filteredSets.length === 0 && (
              <p className="text-xs text-cf-cream-dark italic">No sets match</p>
            )}
          </div>
        </Section>
      )}

      {/* Price Range */}
      <Section title="Price Range" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min $"
            value={activeMinPrice}
            min={0}
            onChange={(e) => setParam("minPrice", e.target.value || null)}
            className="w-full bg-cf-darker border border-cf-border rounded px-2 py-1.5 text-xs text-cf-cream placeholder-cf-cream-dark outline-none focus:border-cf-red transition-colors"
          />
          <span className="text-cf-cream-dark text-xs shrink-0">–</span>
          <input
            type="number"
            placeholder="Max $"
            value={activeMaxPrice}
            min={0}
            onChange={(e) => setParam("maxPrice", e.target.value || null)}
            className="w-full bg-cf-darker border border-cf-border rounded px-2 py-1.5 text-xs text-cf-cream placeholder-cf-cream-dark outline-none focus:border-cf-red transition-colors"
          />
        </div>
      </Section>

      {/* In Stock */}
      <div className="pt-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() =>
              setParam("inStock", activeInStock ? null : "true")
            }
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              activeInStock ? "bg-cf-red" : "bg-cf-border"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                activeInStock ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </div>
          <span className="text-xs text-cf-cream-dark">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  // When rendered inside MobileFilterButton (onMobileClose provided),
  // skip the desktop aside — it's already rendered by the parent's FiltersSidebar.
  const isMobileOnlyInstance = typeof onMobileClose === "function";

  return (
    <>
      {/* Desktop sidebar — only rendered by the standalone instance in the page */}
      {!isMobileOnlyInstance && (
        <aside className="hidden lg:block w-56 shrink-0">{sidebar}</aside>
      )}

      {/* Mobile drawer */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-cf-surface border-r border-cf-border p-4 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xl text-cf-cream">Filters</span>
              <button onClick={onMobileClose}>
                <X size={20} className="text-cf-cream-dark" />
              </button>
            </div>
            {sidebar}
            <div className="mt-4 pt-4 border-t border-cf-border">
              <button
                onClick={onMobileClose}
                className="w-full bg-cf-red text-white py-2.5 rounded font-medium text-sm"
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
