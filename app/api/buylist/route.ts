import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const q = searchParams.get("q") ?? "";
  const game = searchParams.get("game");
  const condition = searchParams.getAll("condition");
  const sets = searchParams.getAll("set");
  const rarity = searchParams.getAll("rarity");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(48, Number(searchParams.get("limit") ?? "24"));

  const where: Prisma.ProductWhereInput = {
    buyCashPrice: { not: null },
  };

  if (game) where.game = game as Prisma.EnumGameFilter["equals"];
  if (condition.length)
    where.condition = { in: condition as Prisma.EnumConditionFilter["in"] };
  if (sets.length) where.setName = { in: sets };
  if (rarity.length) where.rarity = { in: rarity };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { setName: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { buyCashPrice: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        game: true,
        setName: true,
        condition: true,
        buyCashPrice: true,
        buyCreditPrice: true,
        quantity: true,
        isFoil: true,
        rarity: true,
        imageUrl: true,
      },
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null,
      buyCreditPrice: p.buyCreditPrice ? Number(p.buyCreditPrice) : null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
