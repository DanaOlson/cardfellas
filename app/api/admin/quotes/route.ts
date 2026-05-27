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
  if (status && ["PENDING", "REVIEWED", "ACCEPTED", "DECLINED"].includes(status)) {
    where.status = status;
  }

  const [total, quotes] = await Promise.all([
    prisma.sellQuote.count({ where }),
    prisma.sellQuote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, setName: true, imageUrl: true } },
          },
        },
      },
    }),
  ]);

  const mapped = quotes.map((q) => ({
    ...q,
    totalCash: q.totalCash ? Number(q.totalCash) : null,
    totalCredit: q.totalCredit ? Number(q.totalCredit) : null,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  }));

  return NextResponse.json({ quotes: mapped, total, page, pageSize: PAGE_SIZE });
}
