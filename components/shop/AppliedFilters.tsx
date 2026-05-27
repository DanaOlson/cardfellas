"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

export function AppliedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { label: string; remove: () => void }[] = [];

  const q = searchParams.get("q");
  if (q) {
    chips.push({
      label: `"${q}"`,
      remove: () => {
        const p = new URLSearchParams(searchParams.toString());
        p.delete("q");
        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
      },
    });
  }

  const removeArrayValue = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    const vals = p.getAll(key).filter((v) => v !== value);
    p.delete(key);
    vals.forEach((v) => p.append(key, v));
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const removeSingle = (key: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  searchParams.getAll("condition").forEach((c) => {
    chips.push({ label: `Condition: ${c}`, remove: () => removeArrayValue("condition", c) });
  });
  searchParams.getAll("set").forEach((s) => {
    chips.push({ label: `Set: ${s}`, remove: () => removeArrayValue("set", s) });
  });
  searchParams.getAll("rarity").forEach((r) => {
    chips.push({ label: `Rarity: ${r}`, remove: () => removeArrayValue("rarity", r) });
  });
  searchParams.getAll("color").forEach((c) => {
    chips.push({ label: `Color: ${c}`, remove: () => removeArrayValue("color", c) });
  });
  const foil = searchParams.get("foil");
  if (foil === "true") chips.push({ label: "Foil", remove: () => removeSingle("foil") });
  if (foil === "false") chips.push({ label: "Normal", remove: () => removeSingle("foil") });
  if (searchParams.get("inStock") === "true") {
    chips.push({ label: "In Stock", remove: () => removeSingle("inStock") });
  }
  const min = searchParams.get("minPrice");
  const max = searchParams.get("maxPrice");
  if (min || max) {
    chips.push({
      label: `Price: ${min ? `$${min}` : "$0"} – ${max ? `$${max}` : "any"}`,
      remove: () => {
        const p = new URLSearchParams(searchParams.toString());
        p.delete("minPrice");
        p.delete("maxPrice");
        router.replace(`${pathname}?${p.toString()}`, { scroll: false });
      },
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.remove}
          className="flex items-center gap-1.5 bg-cf-red/20 border border-cf-red/40 text-cf-cream text-xs px-2.5 py-1 rounded-full hover:bg-cf-red/30 transition-colors"
        >
          {chip.label}
          <X size={10} />
        </button>
      ))}
    </div>
  );
}
