"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge, gameBadgeVariant, gameLabel } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

type SearchResult = {
  id: string;
  name: string;
  game: string;
  setName: string;
  condition: string;
  price: number;
  imageUrl: string | null;
};

export function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(q)}&searchOnly=true`
        );
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-cf-surface border border-cf-border rounded-lg px-3 py-2 focus-within:border-cf-red transition-colors">
        <Search size={16} className="text-cf-cream-dark shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search cards, sets..."
          className="flex-1 bg-transparent text-cf-cream placeholder-cf-cream-dark text-sm outline-none min-w-0"
        />
        {query && (
          <button onClick={clear} className="text-cf-cream-dark hover:text-cf-cream shrink-0">
            <X size={14} />
          </button>
        )}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-cf-red shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
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
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-cf-surface border border-cf-border rounded-lg shadow-2xl overflow-hidden animate-fade-in">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-cf-cream-dark text-sm">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <ul>
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/shop/${r.game.toLowerCase()}?q=${encodeURIComponent(r.name)}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-cf-border transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <div className="w-10 h-12 shrink-0 relative rounded overflow-hidden bg-cf-darker">
                        {r.imageUrl ? (
                          <Image
                            src={r.imageUrl}
                            alt={r.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cf-cream-dark text-xs">
                            ?
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-cf-cream text-sm font-medium truncate">
                          {r.name}
                        </p>
                        <p className="text-cf-cream-dark text-xs truncate">
                          {r.setName} · {r.condition}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={gameBadgeVariant(r.game)}>
                            {gameLabel(r.game)}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-cf-gold font-semibold text-sm shrink-0">
                        {formatPrice(r.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/shop?q=${encodeURIComponent(query)}`}
                className="flex items-center justify-center gap-2 px-4 py-3 text-cf-red text-sm font-medium hover:bg-cf-border border-t border-cf-border transition-colors"
                onClick={() => setOpen(false)}
              >
                See all results for &ldquo;{query}&rdquo;
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
