import { prisma } from "@/lib/prisma";
import { HeroBanner } from "@/components/home/HeroBanner";
import { FeaturedSingles, FeaturedBuylist } from "@/components/home/FeaturedSection";
import { RecentlyAdded } from "@/components/home/RecentlyAdded";
import { EventsPreview } from "@/components/home/EventsPreview";

export const revalidate = 60;

async function getFeaturedProducts() {
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
  return products.map((p) => ({ ...p, price: Number(p.price) }));
}

async function getBuylistFeatured() {
  const products = await prisma.product.findMany({
    where: { isBuylistFeatured: true, buyCashPrice: { not: null } },
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
  return products.map((p) => ({
    ...p,
    buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null,
    buyCreditPrice: p.buyCreditPrice ? Number(p.buyCreditPrice) : null,
  }));
}

async function getRecentProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
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
  return products.map((p) => ({ ...p, price: Number(p.price) }));
}

async function getUpcomingEvents() {
  const events = await prisma.event.findMany({
    where: { isActive: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 5,
  });
  return events.map((e) => ({
    ...e,
    entryFee: Number(e.entryFee),
    date: e.date.toISOString(),
    endTime: e.endTime?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  }));
}

export default async function HomePage() {
  const [featured, buylist, recent, events] = await Promise.all([
    getFeaturedProducts(),
    getBuylistFeatured(),
    getRecentProducts(),
    getUpcomingEvents(),
  ]);

  return (
    <>
      <HeroBanner />
      <EventsPreview events={events} />
      <FeaturedSingles products={featured} />
      <FeaturedBuylist products={buylist} />
      <RecentlyAdded products={recent} />
    </>
  );
}
