import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "../route";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const d = parsed.data;
  try {
    const product = await prisma.product.update({
      where: { id: params.id },
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
    return NextResponse.json({ ...product, price: Number(product.price) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
