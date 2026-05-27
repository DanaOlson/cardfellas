"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, LogIn, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { SearchDropdown } from "./SearchDropdown";

function CardFellasLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <svg
        width="44"
        height="44"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="cfRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#C62828" />
          </linearGradient>
          <mask id="mRed">
            <circle cx="43" cy="50" r="38" fill="white" />
            <circle cx="43" cy="50" r="26" fill="black" />
            <rect x="43" y="14" width="57" height="72" fill="black" />
          </mask>
          <mask id="mWhite">
            <circle cx="57" cy="50" r="30" fill="white" />
            <circle cx="57" cy="50" r="19" fill="black" />
            <rect x="0" y="22" width="57" height="56" fill="black" />
          </mask>
        </defs>
        <rect width="100" height="100" fill="url(#cfRed)" mask="url(#mRed)" />
        <rect width="100" height="100" fill="white" mask="url(#mWhite)" opacity="0.92" />
      </svg>
      <div className="leading-none">
        <div className="font-display text-white text-2xl tracking-wide">
          CardFellas
        </div>
        <div className="text-[9px] tracking-[0.25em] text-cf-gold uppercase font-medium">
          Buy · Sell · Trade
        </div>
      </div>
    </Link>
  );
}

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/sell", label: "Sell" },
  { href: "/play", label: "Play" },
];

export function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cf-dark/95 backdrop-blur-md border-b border-cf-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main row */}
        <div className="flex items-center gap-4 h-16">
          <CardFellasLogo />

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 font-display text-lg text-cf-cream hover:text-cf-gold transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
            <SearchDropdown />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={session ? "/account" : "/login"}
              className="p-2 text-cf-cream-dark hover:text-cf-cream transition-colors"
              aria-label={session ? "Account" : "Sign In"}
            >
              {session ? <User size={20} /> : <LogIn size={20} />}
            </Link>

            <button
              onClick={() => toggleCart()}
              className="relative p-2 text-cf-cream-dark hover:text-cf-cream transition-colors"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-cf-red text-white text-[10px] font-bold px-1">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-cf-cream-dark hover:text-cf-cream transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchDropdown />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cf-border bg-cf-surface animate-fade-in">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 font-display text-xl text-cf-cream hover:text-cf-gold border-b border-cf-border last:border-0 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={session ? "/account" : "/login"}
              className="py-3 font-display text-xl text-cf-cream hover:text-cf-gold transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {session ? "Account" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
