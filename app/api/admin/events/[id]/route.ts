import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "../route";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const d = parsed.data;
  try {
    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: d.title,
        game: d.game ?? null,
        date: new Date(d.date),
        endTime: d.endTime ? new Date(d.endTime) : null,
        entryFee: d.entryFee,
        format: d.format || null,
        description: d.description || null,
        registrationUrl: d.registrationUrl || null,
        ageRestriction: d.ageRestriction || null,
        isActive: d.isActive ?? true,
      },
    });
    return NextResponse.json({ ...event, entryFee: Number(event.entryFee) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await prisma.event.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
