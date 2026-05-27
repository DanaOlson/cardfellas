import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../ProductForm";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();

  const initial = {
    id: product.id,
    name: product.name,
    game: product.game,
    setName: product.setName,
    setCode: product.setCode ?? "",
    condition: product.condition,
    price: Number(product.price),
    buyCashPrice: product.buyCashPrice ? Number(product.buyCashPrice) : null,
    buyCreditPrice: product.buyCreditPrice ? Number(product.buyCreditPrice) : null,
    quantity: product.quantity,
    isFoil: product.isFoil,
    rarity: product.rarity ?? "",
    colorIdentity: product.colorIdentity ?? "",
    imageUrl: product.imageUrl ?? "",
    isFeatured: product.isFeatured,
    isBuylistFeatured: product.isBuylistFeatured,
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs text-cf-cream-dark mb-2">
          <Link href="/admin/products" className="hover:text-cf-cream">Products</Link>
          <ChevronRight size={12} />
          <span className="text-cf-cream truncate">{product.name}</span>
        </div>
        <h1 className="font-display text-4xl text-cf-cream">Edit Product</h1>
      </div>
      <ProductForm initial={initial} />
    </div>
  );
}
