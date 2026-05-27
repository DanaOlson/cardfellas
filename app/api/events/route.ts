import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const upcoming = searchParams.get("upcoming") !== "false";
  const limit = Math.min(20, Number(searchParams.get("limit") ?? "10"));

  const now = new Date();

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      ...(upcoming ? { date: { gte: now } } : { date: { lt: now } }),
    },
    orderBy: { date: upcoming ? "asc" : "desc" },
    take: limit,
  });

  return NextResponse.json(
    events.map((e) => ({
      ...e,
      entryFee: Number(e.entryFee),
    }))
  );
}
