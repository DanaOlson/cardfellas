import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { slugToGame, formatGame, formatPrice, gameToSlug } from "@/lib/utils";
import { Badge, gameBadgeVariant, conditionBadgeVariant, gameLabel } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

const VALID_GAMES = ["magic", "pokemon", "yugioh", "sports", "other"];

const CONDITION_LABELS: Record<string, string> = {
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};

export async function generateMetadata({
  params,
}: {
  params: { game: string; id: string };
}): Promise<Metadata> {
  if (!VALID_GAMES.includes(params.game)) return {};
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true, setName: true, game: true, condition: true, price: true, imageUrl: true },
  });
  if (!product) return {};
  const title = `${product.name} (${product.condition}) — ${product.setName}`;
  return {
    title,
    description: `Buy ${product.name} (${CONDITION_LABELS[product.condition] ?? product.condition}) from ${product.setName} for ${formatPrice(Number(product.price))} at CardFellas in Layton, UT.`,
    openGraph: {
      title,
      images: product.imageUrl ? [{ url: product.imageUrl }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { game: string; id: string };
}) {
  if (!VALID_GAMES.includes(params.game)) notFound();

  const game = slugToGame(params.game);

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      game: true,
      setName: true,
      setCode: true,
      condition: true,
      price: true,
      quantity: true,
      isFoil: true,
      rarity: true,
      colorIdentity: true,
      imageUrl: true,
    },
  });

  if (!product || product.game !== game) notFound();

  // Fetch related listings (same name, other conditions/sets) in parallel with nothing else to wait for
  const relatedProducts = await prisma.product.findMany({
    where: {
      game: game as never,
      name: product.name,
      id: { not: product.id },
      quantity: { gt: 0 },
    },
    orderBy: { price: "asc" },
    take: 6,
    select: {
      id: true,
      name: true,
      setName: true,
      condition: true,
      price: true,
      quantity: true,
      isFoil: true,
      imageUrl: true,
    },
  });

  const price = Number(product.price);
  const inStock = product.quantity > 0;
  const gameSlug = gameToSlug(product.game);

  const cartProduct = {
    id: product.id,
    name: product.name,
    game: product.game,
    setName: product.setName,
    condition: product.condition,
    price,
    imageUrl: product.imageUrl ?? null,
    quantity: product.quantity,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-cf-cream-dark mb-6">
        <Link href="/shop" className="hover:text-cf-cream transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/shop/${gameSlug}`} className="hover:text-cf-cream transition-colors">
          {formatGame(product.game)}
        </Link>
        <span>/</span>
        <span className="text-cf-cream truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="flex justify-center md:justify-start">
          <div className="relative w-64 sm:w-72 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-cf-darker border border-cf-border shadow-2xl">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="288px"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-cf-border">
                <ImageOff size={40} />
                <span className="text-xs text-cf-cream-dark text-center px-4 leading-snug">
                  {product.name}
                </span>
              </div>
            )}
            {product.isFoil && (
              <span className="absolute top-2 right-2">
                <Badge variant="foil">✦ Foil</Badge>
              </span>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-cf-cream-dark text-sm font-medium">Out of Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="font-display text-4xl text-cf-cream leading-tight mb-1">
              {product.name}
            </h1>
            <p className="text-cf-cream-dark text-sm">
              {product.setName}
              {product.setCode && (
                <span className="ml-2 text-xs text-cf-border">[{product.setCode}]</span>
              )}
            </p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={gameBadgeVariant(product.game)}>{gameLabel(product.game)}</Badge>
            <Badge variant={conditionBadgeVariant(product.condition)}>
              {CONDITION_LABELS[product.condition] ?? product.condition}
            </Badge>
            {product.rarity && (
              <span className="text-xs text-cf-cream-dark">{product.rarity}</span>
            )}
            {product.colorIdentity && (
              <span className="text-xs text-cf-cream-dark">
                Colors: {product.colorIdentity}
              </span>
            )}
          </div>

          {/* Price & Stock */}
          <div className="bg-cf-surface border border-cf-border rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-cf-cream-dark text-xs mb-0.5">Price</p>
              <p className="font-display text-4xl text-cf-gold">{formatPrice(price)}</p>
            </div>
            <div className="text-right">
              <p className="text-cf-cream-dark text-xs mb-0.5">Availability</p>
              {inStock ? (
                <p className={`text-sm font-medium ${product.quantity <= 3 ? "text-yellow-400" : "text-emerald-400"}`}>
                  {product.quantity <= 3 ? `Only ${product.quantity} left` : "In Stock"}
                </p>
              ) : (
                <p className="text-red-400 text-sm font-medium">Out of Stock</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <AddToCartButton product={cartProduct} inStock={inStock} />
            <WishlistButton productId={product.id} />
          </div>

          {/* Pickup info */}
          <p className="text-xs text-cf-cream-dark">
            In-store pickup only · 1596 N Hill Field Rd, Suite B, Layton, UT 84041
          </p>

          {/* Back link */}
          <Link
            href={`/shop/${gameSlug}`}
            className="inline-flex items-center gap-1.5 text-sm text-cf-cream-dark hover:text-cf-red transition-colors mt-auto"
          >
            <ArrowLeft size={14} />
            Back to {formatGame(product.game)}
          </Link>
        </div>
      </div>

      {/* Related listings (same card, other conditions/sets) */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-cf-cream mb-4">
            Other Listings for &ldquo;{product.name}&rdquo;
          </h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-cf-border text-cf-cream-dark text-xs uppercase tracking-wide">
                  <th className="text-left py-2 pr-4 font-medium">Set</th>
                  <th className="text-left py-2 pr-4 font-medium">Condition</th>
                  <th className="text-left py-2 pr-4 font-medium">Stock</th>
                  <th className="text-right py-2 font-medium">Price</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-cf-border">
                {relatedProducts.map((r) => (
                  <tr key={r.id} className="hover:bg-cf-surface/60 transition-colors">
                    <td className="py-2.5 pr-4 text-cf-cream truncate max-w-[160px]">
                      {r.setName}
                      {r.isFoil && (
                        <span className="ml-1.5 text-[10px] text-cf-gold">✦ Foil</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-cf-cream-dark">
                      {CONDITION_LABELS[r.condition] ?? r.condition}
                    </td>
                    <td className="py-2.5 pr-4 text-cf-cream-dark">
                      {r.quantity <= 3 ? (
                        <span className="text-yellow-400">{r.quantity} left</span>
                      ) : (
                        <span className="text-emerald-400">In Stock</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-cf-gold font-bold">
                      {formatPrice(Number(r.price))}
                    </td>
                    <td className="py-2.5 pl-4 text-right">
                      <Link
                        href={`/shop/${gameSlug}/${r.id}`}
                        className="text-xs text-cf-cream-dark hover:text-cf-red transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
