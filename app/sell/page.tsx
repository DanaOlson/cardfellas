import type { Metadata } from "next";
import { SellPageClient } from "./SellPageClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Sell Cards",
  description:
    "Get top dollar for your cards. Check our buylist for cash and store credit prices on Magic, Pokémon, Yu-Gi-Oh!, sports cards, and more.",
};

export const revalidate = 60;

export default async function SellPage() {
  // Fetch initial buylist (first page, all games) — matches client limit
  const [products, sets] = await Promise.all([
    prisma.product.findMany({
      where: { buyCashPrice: { not: null } },
      orderBy: { buyCashPrice: "desc" },
      take: 48,
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
    }),
    prisma.product.findMany({
      where: { buyCashPrice: { not: null } },
      select: { setName: true, setCode: true },
      distinct: ["setName"],
      orderBy: { setName: "asc" },
    }),
  ]);

  const initial = products.map((p) => ({
    ...p,
    buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null,
    buyCreditPrice: p.buyCreditPrice ? Number(p.buyCreditPrice) : null,
  }));

  const setOptions = sets.map((s) => ({ name: s.setName, code: s.setCode }));

  return <SellPageClient initialProducts={initial} sets={setOptions} />;
}
