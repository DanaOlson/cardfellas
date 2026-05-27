import Link from "next/link";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com/cardfellasllc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/profile.php?id=61576100091543",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@cardfellastcg",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.gg/fRRf7qTnsy",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.134 18.111a19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    label: "Twitch",
    href: "https://twitch.tv/cardfellas",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
];

const shopLinks = [
  { href: "/shop/magic", label: "Magic: The Gathering" },
  { href: "/shop/pokemon", label: "Pokémon TCG" },
  { href: "/shop/yugioh", label: "Yu-Gi-Oh!" },
  { href: "/shop/sports", label: "Sports Cards" },
  { href: "/shop/other", label: "Other Games" },
];

const infoLinks = [
  { href: "/sell", label: "Sell Cards" },
  { href: "/play", label: "Events & Play" },
  { href: "/account", label: "My Account" },
  { href: "/login", label: "Sign In" },
];

export function Footer() {
  return (
    <footer className="bg-cf-darker border-t border-cf-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="font-display text-3xl text-white tracking-wide mb-1">
              CardFellas
            </div>
            <div className="text-xs tracking-[0.25em] text-cf-gold uppercase mb-4">
              Buy · Sell · Trade
            </div>
            <p className="text-cf-cream-dark text-sm leading-relaxed mb-4">
              Your local TCG destination in Layton, UT. We buy, sell, and trade
              Magic, Pokémon, Yu-Gi-Oh, sports cards, and more.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-cf-cream-dark hover:text-cf-gold transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="font-display text-lg text-cf-cream mb-4 tracking-wide">
              Shop
            </h3>
            <ul className="space-y-2">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-cf-cream-dark text-sm hover:text-cf-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="font-display text-lg text-cf-cream mb-4 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {infoLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-cf-cream-dark text-sm hover:text-cf-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg text-cf-cream mb-4 tracking-wide">
              Visit Us
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 text-sm text-cf-cream-dark">
                <MapPin size={16} className="shrink-0 text-cf-gold mt-0.5" />
                <span>
                  1596 N Hill Field Rd, Suite B
                  <br />
                  Layton, UT 84041
                </span>
              </li>
              <li className="flex gap-2 text-sm text-cf-cream-dark">
                <Phone size={16} className="shrink-0 text-cf-gold mt-0.5" />
                <a
                  href="tel:+13853482682"
                  className="hover:text-cf-gold transition-colors"
                >
                  (385) 348-2682
                </a>
              </li>
              <li className="flex gap-2 text-sm text-cf-cream-dark">
                <Mail size={16} className="shrink-0 text-cf-gold mt-0.5" />
                <a
                  href="mailto:Cardfellastcg@gmail.com"
                  className="hover:text-cf-gold transition-colors break-all"
                >
                  Cardfellastcg@gmail.com
                </a>
              </li>
              <li className="flex gap-2 text-sm text-cf-cream-dark">
                <Globe size={16} className="shrink-0 text-cf-gold mt-0.5" />
                <a
                  href="https://Cardfellastcg.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cf-gold transition-colors"
                >
                  Cardfellastcg.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-cf-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cf-cream-dark text-xs">
            © {new Date().getFullYear()} CardFellas LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Language toggle placeholder */}
            <div className="flex items-center gap-1 bg-cf-surface rounded border border-cf-border px-2 py-1">
              <button className="text-xs font-medium text-cf-cream px-1.5 py-0.5 rounded bg-cf-red">
                EN
              </button>
              <button className="text-xs font-medium text-cf-cream-dark px-1.5 py-0.5 hover:text-cf-cream transition-colors">
                ES
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
