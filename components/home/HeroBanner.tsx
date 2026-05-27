import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Calendar } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative bg-cf-darker overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cf-red/20 via-cf-dark to-cf-darker" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cf-red/10 via-transparent to-transparent" />

      {/* Decorative card shapes */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-10 pointer-events-none hidden lg:block">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-lg border border-cf-gold/30 bg-gradient-to-br from-cf-gold/5 to-cf-red/5"
            style={{
              width: "140px",
              height: "195px",
              right: `${80 + i * 50}px`,
              top: `${-20 + i * 30}px`,
              transform: `rotate(${-15 + i * 6}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          {/* Grand Opening badge */}
          <div className="inline-flex items-center gap-2 bg-cf-gold/20 border border-cf-gold/40 rounded-full px-4 py-1.5 mb-6">
            <Calendar size={14} className="text-cf-gold" />
            <span className="text-cf-gold text-sm font-medium">
              Grand Opening · October 1st, 2026
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl text-white leading-none mb-4">
            Collect,
            <span className="text-cf-red block">Trade &amp;</span>
            Discover
            <span className="text-cf-gold block">Rare Cards</span>
          </h1>

          <p className="text-cf-cream-dark text-lg mb-8 leading-relaxed">
            Layton&rsquo;s premier TCG destination. We buy, sell, and trade
            Magic: The Gathering, Pokémon, Yu-Gi-Oh!, sports cards, and more.
            Walk in or browse online.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="lg" asChild>
              <Link href="/shop" className="flex items-center gap-2">
                Browse Shop <ArrowRight size={16} />
              </Link>
            </Button>
            <Button variant="gold" size="lg" asChild>
              <Link href="/sell">Sell Your Cards</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/play">View Events</Link>
            </Button>
          </div>

          {/* Location */}
          <p className="mt-8 text-cf-cream-dark text-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            1596 N Hill Field Rd, Suite B · Layton, UT 84041
          </p>
        </div>
      </div>
    </section>
  );
}
