import Link from "next/link";
import { ArrowRight, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { Badge, gameBadgeVariant, gameLabel } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

type Event = {
  id: string;
  title: string;
  game: string | null;
  date: string;
  endTime: string | null;
  entryFee: number;
  format: string | null;
  description: string | null;
  registrationUrl: string | null;
  ageRestriction: string | null;
};

function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

interface EventsPreviewProps {
  events: Event[];
}

export function EventsPreview({ events }: EventsPreviewProps) {
  if (!events.length) return null;
  return (
    <section className="py-12 bg-cf-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-cf-gold" />
              <h2 className="font-display text-3xl sm:text-4xl text-cf-cream tracking-wide">
                Upcoming Events
              </h2>
            </div>
            <p className="text-cf-cream-dark text-sm">
              Tournaments, leagues, and special events
            </p>
          </div>
          <Link
            href="/play"
            className="flex items-center gap-1.5 text-cf-gold text-sm font-medium hover:text-cf-gold-light transition-colors"
          >
            See All Events <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.slice(0, 6).map((event) => {
            const { date, time } = formatEventDate(event.date);
            return (
              <div
                key={event.id}
                className="bg-cf-surface border border-cf-border rounded-lg overflow-hidden hover:border-cf-gold/40 transition-colors group"
              >
                {/* Color bar by game */}
                <div
                  className={`h-1 ${
                    event.game === "MAGIC"
                      ? "bg-blue-500"
                      : event.game === "POKEMON"
                      ? "bg-yellow-400"
                      : event.game === "YUGIOH"
                      ? "bg-purple-500"
                      : "bg-cf-gold"
                  }`}
                />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display text-lg text-cf-cream leading-tight group-hover:text-cf-gold transition-colors">
                      {event.title}
                    </h3>
                    {event.game && (
                      <Badge variant={gameBadgeVariant(event.game)} className="shrink-0">
                        {gameLabel(event.game)}
                      </Badge>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-cf-cream-dark text-xs leading-relaxed line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-cf-cream-dark">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-cf-gold" />
                      {date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-cf-gold" />
                      {time}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} className="text-cf-gold" />
                      {event.entryFee === 0 ? "Free" : formatPrice(event.entryFee)}
                    </span>
                    {event.format && (
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-cf-gold" />
                        {event.format}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <Link
                      href={event.registrationUrl ?? "/play"}
                      target={event.registrationUrl ? "_blank" : undefined}
                      rel={event.registrationUrl ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-cf-red hover:text-cf-red-light transition-colors"
                    >
                      {event.registrationUrl ? "Register" : "Learn More"}
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
