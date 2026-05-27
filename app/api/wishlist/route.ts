import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session : null;
}

/** GET /api/wishlist — returns the logged-in user's wishlisted product IDs */
export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ productIds: [] });

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return NextResponse.json({ productIds: items.map((i) => i.productId) });
}

const ToggleSchema = z.object({ productId: z.string().cuid() });

/** POST /api/wishlist — toggles a product in/out of the user's wishlist */
export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to use the wishlist" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const { productId } = parsed.data;
  const userId = session.user.id;

  // Check if the product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return NextResponse.json({ added: false });
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
    return NextResponse.json({ added: true });
  }
}
