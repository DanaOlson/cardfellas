import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

const VALID_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED"];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  try {
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json({ ...order, total: Number(order.total) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
