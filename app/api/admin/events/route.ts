import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

export const eventSchema = z.object({
  title: z.string().min(1),
  game: z.enum(["MAGIC", "POKEMON", "YUGIOH", "SPORTS", "OTHER"]).nullable().optional(),
  date: z.string().min(1),
  endTime: z.string().nullable().optional(),
  entryFee: z.number().min(0),
  format: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  registrationUrl: z.string().nullable().optional(),
  ageRestriction: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(events.map((e) => ({ ...e, entryFee: Number(e.entryFee) })));
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const d = parsed.data;
  const event = await prisma.event.create({
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
  return NextResponse.json({ ...event, entryFee: Number(event.entryFee) }, { status: 201 });
}
