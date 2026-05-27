"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Calendar,
  ShoppingBag,
  ClipboardList,
  Upload,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/events", label: "Events", icon: Calendar, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/quotes", label: "Sell Quotes", icon: ClipboardList, exact: false },
  { href: "/admin/import", label: "Import", icon: Upload, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-cf-border bg-cf-surface flex flex-col">
      <div className="px-4 py-4 border-b border-cf-border">
        <p className="text-xs uppercase tracking-widest text-cf-cream-dark font-medium">
          Admin Panel
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-cf-red/10 text-cf-cream border border-cf-red/20"
                  : "text-cf-cream-dark hover:text-cf-cream hover:bg-cf-darker"
              )}
            >
              <item.icon size={15} className={active ? "text-cf-red" : ""} />
              <span>{item.label}</span>
              {active && <ChevronRight size={13} className="ml-auto text-cf-red" />}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-cf-border">
        <Link
          href="/"
          className="text-xs text-cf-cream-dark hover:text-cf-cream transition-colors"
        >
          ← Back to store
        </Link>
      </div>
    </aside>
  );
}
