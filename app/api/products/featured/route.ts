import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, quantity: { gt: 0 } },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      game: true,
      setName: true,
      condition: true,
      price: true,
      quantity: true,
      isFoil: true,
      rarity: true,
      imageUrl: true,
    },
  });

  return NextResponse.json(
    products.map((p) => ({ ...p, price: Number(p.price) }))
  );
}
