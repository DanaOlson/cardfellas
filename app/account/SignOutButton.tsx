"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-cf-surface border border-cf-border text-cf-cream-dark rounded-lg hover:border-cf-red hover:text-cf-red transition-colors"
    >
      <LogOut size={13} /> Sign Out
    </button>
  );
}
