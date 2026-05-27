"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ImageOff, Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge, gameBadgeVariant, conditionBadgeVariant, gameLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart, CartProduct } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, gameToSlug } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type ProductCardData = {
  id: string;
  name: string;
  game: string;
  setName: string;
  condition: string;
  price: number;
  quantity: number;
  isFoil?: boolean;
  rarity?: string | null;
  imageUrl?: string | null;
};

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { data: session } = useSession();
  const inStock = product.quantity > 0;
  const wishlisted = isWishlisted(product.id);

  const cartProduct: CartProduct = {
    id: product.id,
    name: product.name,
    game: product.game,
    setName: product.setName,
    condition: product.condition,
    price: product.price,
    imageUrl: product.imageUrl ?? null,
    quantity: product.quantity,
  };

  const detailHref = `/shop/${gameToSlug(product.game)}/${product.id}`;

  return (
    <div
      className={cn(
        "group bg-cf-surface border border-cf-border rounded-lg overflow-hidden flex flex-col hover:border-cf-red/50 transition-colors duration-200",
        className
      )}
    >
      {/* Card image — links to detail page */}
      <Link href={detailHref} tabIndex={-1} aria-hidden>
      <div className="relative aspect-[2.5/3.5] bg-cf-darker overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-cf-border">
            <ImageOff size={32} />
            <span className="text-xs text-cf-cream-dark text-center px-2 leading-tight">
              {product.name}
            </span>
          </div>
        )}

        {/* Foil badge */}
        {product.isFoil && (
          <span className="absolute top-2 right-2">
            <Badge variant="foil">✦ Foil</Badge>
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-cf-cream-dark text-sm font-medium">Out of Stock</span>
          </div>
        )}

        {/* Wishlist button — only shown for logged-in users */}
        {session?.user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggle(product.id);
            }}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-all",
              wishlisted
                ? "bg-cf-red/90 text-white"
                : "bg-black/40 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-cf-red/80 hover:text-white"
            )}
          >
            <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        )}
      </div>
      </Link>

      {/* Card details */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <Link
            href={detailHref}
            className="text-cf-cream text-sm font-medium leading-tight line-clamp-2 hover:text-cf-gold transition-colors"
          >
            {product.name}
          </Link>
          <p className="text-cf-cream-dark text-xs mt-0.5 truncate">{product.setName}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={gameBadgeVariant(product.game)}>
            {gameLabel(product.game)}
          </Badge>
          <Badge variant={conditionBadgeVariant(product.condition)}>
            {product.condition}
          </Badge>
          {product.rarity && (
            <span className="text-xs text-cf-cream-dark">{product.rarity}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-cf-gold font-bold text-base">
            {formatPrice(product.price)}
          </span>
          {inStock && (
            <span className="text-xs text-cf-cream-dark">
              {product.quantity > 4 ? "In Stock" : `${product.quantity} left`}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-full"
          disabled={!inStock}
          onClick={() => addItem(cartProduct)}
        >
          <ShoppingCart size={14} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}
