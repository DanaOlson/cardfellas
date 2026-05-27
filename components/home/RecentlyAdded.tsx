"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { ProductCard, ProductCardData } from "@/components/shop/ProductCard";

interface RecentlyAddedProps {
  products: ProductCardData[];
}

export function RecentlyAdded({ products }: RecentlyAddedProps) {
  if (!products.length) return null;
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={18} className="text-cf-red" />
              <h2 className="font-display text-3xl sm:text-4xl text-cf-cream tracking-wide">
                Recently Added
              </h2>
            </div>
            <p className="text-cf-cream-dark text-sm">
              Fresh inventory just added to the shop
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
