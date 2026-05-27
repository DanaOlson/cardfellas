import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EventForm } from "../EventForm";

export const metadata: Metadata = { title: "Add Event" };

export default function NewEventPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs text-cf-cream-dark mb-2">
          <Link href="/admin/events" className="hover:text-cf-cream">Events</Link>
          <ChevronRight size={12} />
          <span className="text-cf-cream">New</span>
        </div>
        <h1 className="font-display text-4xl text-cf-cream">Add Event</h1>
      </div>
      <EventForm />
    </div>
  );
}
