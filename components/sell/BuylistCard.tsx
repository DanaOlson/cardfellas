"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { Badge, gameBadgeVariant, conditionBadgeVariant, gameLabel } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type BuylistCardData = {
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

interface BuylistCardProps {
  product: BuylistCardData;
  inSellCart: boolean;
  onToggle: (product: BuylistCardData) => void;
}

export function BuylistCard({ product, inSellCart, onToggle }: BuylistCardProps) {
  return (
    <div
      className={cn(
        "flex gap-3 bg-cf-surface border rounded-lg p-3 transition-colors",
        inSellCart
          ? "border-cf-gold/60 bg-cf-gold/5"
          : "border-cf-border hover:border-cf-gold/30"
      )}
    >
      {/* Image */}
      <div className="w-12 h-16 shrink-0 relative rounded overflow-hidden bg-cf-darker">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cf-border to-cf-darker" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-cf-cream text-sm font-medium leading-tight truncate">
          {product.name}
        </p>
        <p className="text-cf-cream-dark text-xs mt-0.5 truncate">
          {product.setName}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <Badge variant={gameBadgeVariant(product.game)}>
            {gameLabel(product.game)}
          </Badge>
          <Badge variant={conditionBadgeVariant(product.condition)}>
            {product.condition}
          </Badge>
          {product.isFoil && <Badge variant="foil">Foil</Badge>}
        </div>

        <div className="flex items-center gap-4 mt-2">
          {product.buyCashPrice && (
            <div>
              <div className="text-[10px] text-cf-cream-dark uppercase tracking-wide">
                Cash
              </div>
              <div className="text-cf-gold font-bold text-sm">
                {formatPrice(product.buyCashPrice)}
              </div>
            </div>
          )}
          {product.buyCreditPrice && (
            <div>
              <div className="text-[10px] text-cf-cream-dark uppercase tracking-wide">
                Credit
              </div>
              <div className="text-emerald-400 font-bold text-sm">
                {formatPrice(product.buyCreditPrice)}
              </div>
            </div>
          )}
          <button
            onClick={() => onToggle(product)}
            className={cn(
              "ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-colors shrink-0",
              inSellCart
                ? "bg-cf-gold/20 border-cf-gold text-cf-gold hover:bg-red-900/20 hover:border-cf-red hover:text-cf-red"
                : "bg-transparent border-cf-border text-cf-cream-dark hover:border-cf-gold hover:text-cf-gold"
            )}
          >
            {inSellCart ? (
              <>
                <Check size={12} /> Added
              </>
            ) : (
              <>
                <Plus size={12} /> Add to List
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
