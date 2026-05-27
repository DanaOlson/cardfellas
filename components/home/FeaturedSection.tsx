"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/shop/ProductCard";
import { Badge, gameBadgeVariant, gameLabel } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface FeaturedSectionProps {
  products: ProductCardData[];
}

export function FeaturedSingles({ products }: FeaturedSectionProps) {
  if (!products.length) return null;
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-cf-cream tracking-wide">
              Featured Singles
            </h2>
            <p className="text-cf-cream-dark text-sm mt-1">
              Hand-picked cards from our inventory
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-cf-red text-sm font-medium hover:text-cf-red-light transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

type BuylistProduct = {
  id: string;
  name: string;
  game: string;
  setName: string;
  condition: string;
  buyCashPrice: number | null;
  buyCreditPrice: number | null;
  imageUrl: string | null;
  isFoil?: boolean;
  rarity?: string | null;
};

interface BuylistSectionProps {
  products: BuylistProduct[];
}

export function FeaturedBuylist({ products }: BuylistSectionProps) {
  if (!products.length) return null;
  return (
    <section className="py-12 bg-cf-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={20} className="text-cf-gold" />
              <h2 className="font-display text-3xl sm:text-4xl text-cf-cream tracking-wide">
                Top Buylist
              </h2>
            </div>
            <p className="text-cf-cream-dark text-sm">
              Cards we&rsquo;re paying top dollar for right now
            </p>
          </div>
          <Link
            href="/sell"
            className="flex items-center gap-1.5 text-cf-gold text-sm font-medium hover:text-cf-gold-light transition-colors"
          >
            See Full Buylist <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex gap-3 bg-cf-surface border border-cf-border rounded-lg p-3 hover:border-cf-gold/40 transition-colors"
            >
              <div className="w-12 h-16 shrink-0 relative rounded overflow-hidden bg-cf-darker">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cf-border to-cf-darker" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-cf-cream text-sm font-medium leading-tight truncate">
                  {p.name}
                </p>
                <p className="text-cf-cream-dark text-xs truncate mt-0.5">
                  {p.setName} · {p.condition}
                </p>
                <Badge
                  variant={gameBadgeVariant(p.game)}
                  className="mt-1"
                >
                  {gameLabel(p.game)}
                </Badge>
                <div className="flex items-center gap-3 mt-2">
                  {p.buyCashPrice && (
                    <div className="text-center">
                      <div className="text-xs text-cf-cream-dark">Cash</div>
                      <div className="text-cf-gold font-bold text-sm">
                        {formatPrice(p.buyCashPrice)}
                      </div>
                    </div>
                  )}
                  {p.buyCreditPrice && (
                    <div className="text-center">
                      <div className="text-xs text-cf-cream-dark">Credit</div>
                      <div className="text-emerald-400 font-bold text-sm">
                        {formatPrice(p.buyCreditPrice)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-cf-surface border border-cf-gold/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-cf-cream font-medium text-sm">
              Have cards to sell?
            </p>
            <p className="text-cf-cream-dark text-xs mt-0.5">
              Bring them in-store for an instant quote, or browse our full
              buylist online.
            </p>
          </div>
          <Link
            href="/sell"
            className="shrink-0 inline-flex items-center gap-2 bg-cf-gold text-cf-dark font-semibold text-sm px-4 py-2 rounded hover:bg-cf-gold-light transition-colors"
          >
            Sell Cards <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
