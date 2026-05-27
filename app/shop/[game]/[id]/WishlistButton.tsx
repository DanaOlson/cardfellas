"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const { isWishlisted, toggle } = useWishlist();

  if (!session?.user) return null;

  const wishlisted = isWishlisted(productId);

  return (
    <button
      onClick={() => toggle(productId)}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "w-12 h-12 rounded-xl border flex items-center justify-center transition-all shrink-0",
        wishlisted
          ? "bg-cf-red/20 border-cf-red text-cf-red"
          : "border-cf-border text-cf-cream-dark hover:border-cf-red hover:text-cf-red"
      )}
    >
      <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
    </button>
  );
}
