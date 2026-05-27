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
  const foil = searchParams.get("foil");
  const inStock = searchParams.get("inStock") === "true";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(48, Number(searchParams.get("limit") ?? "24"));
  const searchOnly = searchParams.get("searchOnly") === "true";

  const where: Prisma.ProductWhereInput = {};

  if (game) where.game = game as Prisma.EnumGameFilter["equals"];
  if (condition.length) where.condition = { in: condition as Prisma.EnumConditionFilter["in"] };
  if (sets.length) where.setName = { in: sets };
  if (rarity.length) where.rarity = { in: rarity };
  if (foil === "true") where.isFoil = true;
  if (foil === "false") where.isFoil = false;
  if (inStock) where.quantity = { gt: 0 };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Prisma.DecimalFilter).gte = Number(minPrice);
    if (maxPrice) (where.price as Prisma.DecimalFilter).lte = Number(maxPrice);
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { setName: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : sort === "name_asc"
      ? { name: "asc" }
      : { createdAt: "desc" };

  if (searchOnly) {
    const results = await prisma.product.findMany({
      where,
      orderBy,
      take: 8,
      select: {
        id: true,
        name: true,
        game: true,
        setName: true,
        condition: true,
        price: true,
        quantity: true,
        imageUrl: true,
      },
    });
    return NextResponse.json(results.map((p) => ({ ...p, price: Number(p.price) })));
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        game: true,
        setName: true,
        condition: true,
        price: true,
        buyCashPrice: true,
        buyCreditPrice: true,
        quantity: true,
        isFoil: true,
        rarity: true,
        colorIdentity: true,
        imageUrl: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null,
      buyCreditPrice: p.buyCreditPrice ? Number(p.buyCreditPrice) : null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
