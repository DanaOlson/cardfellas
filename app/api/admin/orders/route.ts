import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

const PAGE_SIZE = 50;

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const where: Record<string, unknown> = {};
  if (status && ["PENDING", "PAID", "FULFILLED", "CANCELLED"].includes(status)) {
    where.status = status;
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const mapped = orders.map((o) => ({
    ...o,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    user: o.user ?? null,
    guestName: o.guestName ?? null,
    guestEmail: o.guestEmail ?? null,
    guestPhone: o.guestPhone ?? null,
    pickupNote: o.pickupNote ?? null,
  }));

  return NextResponse.json({ orders: mapped, total, page, pageSize: PAGE_SIZE });
}
