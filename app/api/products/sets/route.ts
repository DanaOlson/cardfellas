import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get("game");

  const where = game ? { game: game as never } : {};

  const sets = await prisma.product.findMany({
    where,
    select: { setName: true, setCode: true },
    distinct: ["setName"],
    orderBy: { setName: "asc" },
  });

  const rarities = await prisma.product.findMany({
    where: { ...where, rarity: { not: null } },
    select: { rarity: true },
    distinct: ["rarity"],
    orderBy: { rarity: "asc" },
  });

  return NextResponse.json({
    sets: sets.map((s) => ({ name: s.setName, code: s.setCode })),
    rarities: rarities.map((r) => r.rarity).filter(Boolean) as string[],
  });
}
