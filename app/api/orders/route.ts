import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
});

const OrderSchema = z.object({
  items: z.array(CartItemSchema).min(1).max(50),
  contact: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().max(200),
    phone: z.string().max(50).optional().default(""),
    pickupNote: z.string().max(1000).optional().default(""),
  }),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, contact } = parsed.data;
  const productIds = items.map((i) => i.productId);

  // Load products from DB to get current prices and stock
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, quantity: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Validate stock
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product ${item.productId} not found` },
        { status: 400 }
      );
    }
    if (product.quantity < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for "${product.name}". Available: ${product.quantity}` },
        { status: 409 }
      );
    }
  }

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + Number(product.price) * item.quantity;
  }, 0);

  const userId = session?.user?.id ?? null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Re-check stock inside transaction to prevent race conditions
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { quantity: true, name: true },
        });
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Out of stock: ${product?.name ?? item.productId}`);
        }
      }

      // Decrement quantities
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Create order — works for both logged-in users and guests
      return await tx.order.create({
        data: {
          ...(userId ? { userId } : {}),
          // Guest contact info (also stored for logged-in users as pickup notes)
          guestName: userId ? null : contact.name,
          guestEmail: userId ? null : contact.email,
          guestPhone: userId ? null : (contact.phone || null),
          pickupNote: contact.pickupNote || null,
          total,
          status: "PENDING",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap.get(item.productId)!.price,
            })),
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      ref: order.id.slice(-8).toUpperCase(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order failed";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
