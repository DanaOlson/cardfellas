import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { EventsActions } from "./EventsActions";

export const metadata: Metadata = { title: "Events" };
export const revalidate = 0;

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });
  const now = new Date();

  const mapped = events.map((e) => ({
    ...e,
    entryFee: Number(e.entryFee),
    isPast: e.date < now,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-cf-cream">Events</h1>
          <p className="text-cf-cream-dark text-sm">{events.length} total</p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-1.5 bg-cf-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shrink-0"
        >
          <Plus size={15} /> Add Event
        </Link>
      </div>

      {mapped.length === 0 ? (
        <div className="border border-cf-border rounded-xl p-10 text-center text-cf-cream-dark">
          No events yet.
        </div>
      ) : (
        <div className="border border-cf-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cf-border bg-cf-darker">
                <th className="text-left px-4 py-3 text-cf-cream-dark font-medium">Event</th>
                <th className="text-left px-4 py-3 text-cf-cream-dark font-medium hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-cf-cream-dark font-medium hidden md:table-cell">Format</th>
                <th className="text-right px-4 py-3 text-cf-cream-dark font-medium hidden sm:table-cell">Fee</th>
                <th className="text-center px-4 py-3 text-cf-cream-dark font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-cf-border">
              {mapped.map((e) => (
                <tr key={e.id} className={`hover:bg-cf-darker/50 transition-colors ${e.isPast ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="text-cf-cream font-medium">{e.title}</p>
                    {e.game && (
                      <p className="text-cf-cream-dark text-xs mt-0.5">{e.game}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cf-cream-dark hidden sm:table-cell">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(e.date)}
                  </td>
                  <td className="px-4 py-3 text-cf-cream-dark hidden md:table-cell">
                    {e.format ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-cf-gold hidden sm:table-cell">
                    {e.entryFee > 0 ? formatPrice(e.entryFee) : "Free"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        e.isPast
                          ? "text-cf-cream-dark border-cf-border"
                          : e.isActive
                          ? "text-emerald-400 border-emerald-700/30 bg-emerald-900/20"
                          : "text-red-400 border-red-700/30 bg-red-900/20"
                      }`}
                    >
                      {e.isPast ? "Past" : e.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EventsActions id={e.id} title={e.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
