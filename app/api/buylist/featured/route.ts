import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      isBuylistFeatured: true,
      buyCashPrice: { not: null },
    },
    orderBy: { buyCashPrice: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      game: true,
      setName: true,
      condition: true,
      buyCashPrice: true,
      buyCreditPrice: true,
      imageUrl: true,
      isFoil: true,
      rarity: true,
    },
  });

  return NextResponse.json(
    products.map((p) => ({
      ...p,
      buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null,
      buyCreditPrice: p.buyCreditPrice ? Number(p.buyCreditPrice) : null,
    }))
  );
}
