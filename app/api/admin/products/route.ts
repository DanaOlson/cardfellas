import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export const productSchema = z.object({
  name: z.string().min(1),
  game: z.enum(["MAGIC", "POKEMON", "YUGIOH", "SPORTS", "OTHER"]),
  setName: z.string().min(1),
  setCode: z.string().optional().nullable(),
  condition: z.enum(["NM", "LP", "MP", "HP", "DMG"]),
  price: z.number().min(0),
  buyCashPrice: z.number().min(0).nullable().optional(),
  buyCreditPrice: z.number().min(0).nullable().optional(),
  quantity: z.number().int().min(0),
  isFoil: z.boolean().optional(),
  rarity: z.string().optional().nullable(),
  colorIdentity: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
  isBuylistFeatured: z.boolean().optional(),
});

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 50;
  const filter = searchParams.get("filter");

  const where: Record<string, unknown> = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (filter === "out_of_stock") where.quantity = 0;
  if (filter === "low_stock") where.quantity = { gt: 0, lte: 3 };
  if (filter === "featured") where.isFeatured = true;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    products: products.map((p) => ({ ...p, price: Number(p.price), buyCashPrice: p.buyCashPrice ? Number(p.buyCashPrice) : null, buyCreditPrice: p.buyCreditPrice ? Number(p.buyCreditPrice) : null })),
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const d = parsed.data;
  const product = await prisma.product.create({
    data: {
      name: d.name,
      game: d.game,
      setName: d.setName,
      setCode: d.setCode || null,
      condition: d.condition,
      price: d.price,
      buyCashPrice: d.buyCashPrice ?? null,
      buyCreditPrice: d.buyCreditPrice ?? null,
      quantity: d.quantity,
      isFoil: d.isFoil ?? false,
      rarity: d.rarity || null,
      colorIdentity: d.colorIdentity || null,
      imageUrl: d.imageUrl || null,
      isFeatured: d.isFeatured ?? false,
      isBuylistFeatured: d.isBuylistFeatured ?? false,
    },
  });
  return NextResponse.json({ ...product, price: Number(product.price) }, { status: 201 });
}
