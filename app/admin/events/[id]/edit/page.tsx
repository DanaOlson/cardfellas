import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EventForm } from "../../EventForm";

export const metadata: Metadata = { title: "Edit Event" };

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();

  const initial = {
    id: event.id,
    title: event.title,
    game: event.game ?? "",
    date: event.date.toISOString(),
    endTime: event.endTime?.toISOString() ?? "",
    entryFee: Number(event.entryFee),
    format: event.format ?? "",
    description: event.description ?? "",
    registrationUrl: event.registrationUrl ?? "",
    ageRestriction: event.ageRestriction ?? "",
    isActive: event.isActive,
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs text-cf-cream-dark mb-2">
          <Link href="/admin/events" className="hover:text-cf-cream">Events</Link>
          <ChevronRight size={12} />
          <span className="text-cf-cream truncate">{event.title}</span>
        </div>
        <h1 className="font-display text-4xl text-cf-cream">Edit Event</h1>
      </div>
      <EventForm initial={initial} />
    </div>
  );
}
