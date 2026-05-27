"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, X, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const CONDITION_LABELS: Record<string, string> = {
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};

interface WishlistProduct {
  id: string;
  name: string;
  game: string;
  setName: string;
  condition: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

interface WishlistItem {
  id: string;
  product: WishlistProduct;
}

interface Props {
  initialItems: WishlistItem[];
}

export function WishlistSection({ initialItems }: Props) {
  const { toggle } = useWishlist();
  const { addItem } = useCart();
  // Maintain local list so removal is instant without a page reload
  const [items, setItems] = useState(initialItems);

  const handleRemove = async (productId: string) => {
    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    await toggle(productId);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Heart size={18} className="text-cf-gold" />
        <h2 className="font-display text-2xl text-cf-cream">
          Wishlist
          {items.length > 0 && (
            <span className="ml-2 text-base text-cf-gold">{items.length}</span>
          )}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="bg-cf-surface border border-cf-border rounded-xl p-8 text-center">
          <p className="text-cf-cream font-medium">Your wishlist is empty</p>
          <p className="text-cf-cream-dark text-sm mt-1">
            Heart any card in the shop to save it here.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-4 text-sm text-cf-gold hover:underline"
          >
            Browse the shop →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => {
            const inStock = item.product.quantity > 0;
            return (
              <div
                key={item.id}
                className="bg-cf-surface border border-cf-border rounded-lg p-3 flex gap-3 group relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cf-darker border border-cf-border flex items-center justify-center text-cf-cream-dark hover:text-cf-red hover:border-cf-red transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={10} />
                </button>

                {item.product.imageUrl && (
                  <div className="relative w-10 h-14 shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                      sizes="40px"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-cf-cream text-sm font-medium truncate">
                    {item.product.name}
                  </p>
                  <p className="text-cf-cream-dark text-xs truncate">
                    {item.product.setName}
                  </p>
                  <p className="text-xs text-cf-cream-dark">
                    {CONDITION_LABELS[item.product.condition] ?? item.product.condition}
                  </p>
                  <p className="text-cf-gold text-sm font-bold mt-1">
                    {formatPrice(item.product.price)}
                  </p>

                  {inStock ? (
                    <button
                      onClick={() =>
                        addItem({
                          id: item.product.id,
                          name: item.product.name,
                          game: item.product.game,
                          setName: item.product.setName,
                          condition: item.product.condition,
                          price: item.product.price,
                          imageUrl: item.product.imageUrl,
                          quantity: item.product.quantity,
                        })
                      }
                      className="mt-1.5 flex items-center gap-1 text-xs text-cf-cream-dark hover:text-cf-gold transition-colors"
                    >
                      <ShoppingCart size={11} /> Add to cart
                    </button>
                  ) : (
                    <span className="text-xs text-red-400">Out of stock</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
