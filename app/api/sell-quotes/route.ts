import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CONDITIONS = ["NM", "LP", "MP", "HP", "DMG"] as const;

const SellItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
  condition: z.enum(CONDITIONS),
});

const SellQuoteSchema = z.object({
  items: z.array(SellItemSchema).min(1).max(200),
  guestEmail: z.string().email().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SellQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items, guestEmail, notes } = parsed.data;
  const productIds = items.map((i) => i.productId);

  // Load products to get buy prices
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, buyCashPrice: true, buyCreditPrice: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate all products exist
  for (const item of items) {
    if (!productMap.has(item.productId)) {
      return NextResponse.json(
        { error: `Product ${item.productId} not found` },
        { status: 400 }
      );
    }
  }

  // Calculate estimated totals
  const totalCash = items.reduce((sum, item) => {
    const p = productMap.get(item.productId)!;
    return sum + (p.buyCashPrice ? Number(p.buyCashPrice) * item.quantity : 0);
  }, 0);

  const totalCredit = items.reduce((sum, item) => {
    const p = productMap.get(item.productId)!;
    return sum + (p.buyCreditPrice ? Number(p.buyCreditPrice) * item.quantity : 0);
  }, 0);

  const userId = session?.user?.id ?? null;

  const quote = await prisma.sellQuote.create({
    data: {
      userId,
      guestEmail: userId ? null : (guestEmail ?? null),
      status: "PENDING",
      totalCash: totalCash > 0 ? totalCash : null,
      totalCredit: totalCredit > 0 ? totalCredit : null,
      notes: notes ?? null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          condition: item.condition,
        })),
      },
    },
  });

  return NextResponse.json({
    success: true,
    quoteId: quote.id,
    ref: quote.id.slice(-8).toUpperCase(),
    totalCash: totalCash > 0 ? totalCash : null,
    totalCredit: totalCredit > 0 ? totalCredit : null,
  });
}
