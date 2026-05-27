import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Calendar, Clock, DollarSign, Tag, ExternalLink, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Play & Events",
  description:
    "Join tournaments, league nights, and special events at CardFellas in Layton, UT. Magic, Pokémon, Yu-Gi-Oh!, and more.",
};

export const revalidate = 60;

const GAME_LABELS: Record<string, string> = {
  MAGIC: "Magic: The Gathering",
  POKEMON: "Pokémon",
  YUGIOH: "Yu-Gi-Oh!",
  SPORTS: "Sports Cards",
  OTHER: "Open",
};

const GAME_COLORS: Record<string, string> = {
  MAGIC: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  POKEMON: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  YUGIOH: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  SPORTS: "bg-green-900/40 text-green-300 border-green-700/50",
  OTHER: "bg-cf-border text-cf-cream-dark border-cf-border",
};

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatEventTime(date: Date, endTime?: Date | null) {
  const start = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  if (!endTime) return start;
  const end = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(endTime);
  return `${start} – ${end}`;
}

function EventCard({
  event,
  isPast,
}: {
  event: {
    id: string;
    title: string;
    game: string | null;
    date: Date;
    endTime: Date | null;
    entryFee: number;
    format: string | null;
    description: string | null;
    registrationUrl: string | null;
    ageRestriction: string | null;
  };
  isPast: boolean;
}) {
  const gameKey = event.game ?? "OTHER";
  const gamePill = GAME_COLORS[gameKey] ?? GAME_COLORS.OTHER;
  const gameLabel = GAME_LABELS[gameKey] ?? "Open";

  return (
    <div
      className={`bg-cf-surface border rounded-xl p-5 flex flex-col gap-4 ${
        isPast ? "opacity-60 border-cf-border" : "border-cf-border hover:border-cf-gold/40 transition-colors"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-2xl text-cf-cream leading-tight">{event.title}</h3>
          {event.format && (
            <p className="text-cf-cream-dark text-xs mt-0.5">{event.format}</p>
          )}
        </div>
        {event.game && (
          <span className={`text-xs px-2 py-0.5 rounded border shrink-0 ${gamePill}`}>
            {gameLabel}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-cf-cream-dark text-sm">
          <Calendar size={14} className="text-cf-gold shrink-0" />
          <span>{formatEventDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-cf-cream-dark text-sm">
          <Clock size={14} className="text-cf-gold shrink-0" />
          <span>{formatEventTime(event.date, event.endTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-cf-cream-dark text-sm">
          <DollarSign size={14} className="text-cf-gold shrink-0" />
          <span>
            {event.entryFee > 0 ? `${formatPrice(event.entryFee)} entry` : "Free"}
          </span>
        </div>
        {event.ageRestriction && (
          <div className="flex items-center gap-2 text-cf-cream-dark text-sm">
            <Tag size={14} className="text-cf-gold shrink-0" />
            <span>{event.ageRestriction}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-cf-cream-dark text-sm leading-relaxed border-t border-cf-border pt-3">
          {event.description}
        </p>
      )}

      {/* CTA */}
      {!isPast && (
        <div className="mt-auto pt-1">
          {event.registrationUrl ? (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-cf-red text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Register <ExternalLink size={13} />
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-cf-gold/10 border border-cf-gold/30 text-cf-gold text-sm px-4 py-2 rounded-lg">
              Walk-ins welcome
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default async function PlayPage() {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { isActive: true, date: { gte: now } },
      orderBy: { date: "asc" },
    }),
    prisma.event.findMany({
      where: { isActive: true, date: { lt: now } },
      orderBy: { date: "desc" },
      take: 12,
    }),
  ]);

  const upcomingMapped = upcoming.map((e) => ({
    ...e,
    entryFee: Number(e.entryFee),
  }));
  const pastMapped = past.map((e) => ({
    ...e,
    entryFee: Number(e.entryFee),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-10 bg-gradient-to-br from-cf-red/10 to-cf-darker border border-cf-red/20 rounded-xl p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-3">
          <Trophy size={28} className="text-cf-gold" />
          <h1 className="font-display text-4xl sm:text-6xl text-cf-cream">
            Play & Events
          </h1>
        </div>
        <p className="text-cf-cream-dark text-base max-w-2xl">
          From casual game nights to competitive tournaments — CardFellas hosts events for
          all skill levels. Check back regularly as we schedule more events leading up to
          our Grand Opening on <span className="text-cf-gold font-medium">October 1st, 2026</span>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-cf-cream-dark">
          <span className="flex items-center gap-1.5 bg-cf-surface border border-cf-border rounded-lg px-3 py-1.5">
            📍 1596 N Hill Field Rd, Suite B, Layton, UT 84041
          </span>
          <span className="flex items-center gap-1.5 bg-cf-surface border border-cf-border rounded-lg px-3 py-1.5">
            📞 (385) 348-2682
          </span>
        </div>
      </div>

      {/* Upcoming events */}
      <section className="mb-12">
        <h2 className="font-display text-3xl text-cf-cream mb-5">
          Upcoming Events
          {upcomingMapped.length > 0 && (
            <span className="ml-3 text-lg text-cf-gold">{upcomingMapped.length}</span>
          )}
        </h2>

        {upcomingMapped.length === 0 ? (
          <div className="border border-cf-border rounded-xl p-10 text-center">
            <p className="text-cf-cream font-medium text-lg">No upcoming events yet</p>
            <p className="text-cf-cream-dark text-sm mt-1">
              Check back soon — events are being added ahead of our Grand Opening!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMapped.map((e) => (
              <EventCard key={e.id} event={e} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* Past events */}
      {pastMapped.length > 0 && (
        <section>
          <h2 className="font-display text-2xl text-cf-cream mb-5 text-cf-cream-dark">
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastMapped.map((e) => (
              <EventCard key={e.id} event={e} isPast={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
