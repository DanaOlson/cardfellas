"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FiltersSidebar } from "./FiltersSidebar";

type FilterSet = { name: string; code: string | null };

interface MobileFilterButtonProps {
  sets: FilterSet[];
  rarities: string[];
  game: string;
}

export function MobileFilterButton({ sets, rarities, game }: MobileFilterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 bg-cf-surface border border-cf-border text-cf-cream text-sm px-3 py-1.5 rounded hover:border-cf-red transition-colors"
      >
        <SlidersHorizontal size={14} />
        Filters
      </button>

      <FiltersSidebar
        sets={sets}
        rarities={rarities}
        game={game}
        isMobileOpen={open}
        onMobileClose={() => setOpen(false)}
      />
    </>
  );
}
