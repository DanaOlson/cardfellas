import { cn } from "@/lib/utils";

type BadgeVariant =
  | "magic"
  | "pokemon"
  | "yugioh"
  | "sports"
  | "other"
  | "nm"
  | "lp"
  | "mp"
  | "hp"
  | "dmg"
  | "foil"
  | "default";

const variantMap: Record<BadgeVariant, string> = {
  magic: "bg-blue-900/60 text-blue-300 border-blue-700",
  pokemon: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  yugioh: "bg-purple-900/60 text-purple-300 border-purple-700",
  sports: "bg-green-900/60 text-green-300 border-green-700",
  other: "bg-cf-surface text-cf-cream-dark border-cf-border",
  nm: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  lp: "bg-green-900/60 text-green-300 border-green-700",
  mp: "bg-yellow-900/60 text-yellow-300 border-yellow-700",
  hp: "bg-orange-900/60 text-orange-300 border-orange-700",
  dmg: "bg-red-900/60 text-red-300 border-red-700",
  foil: "bg-cf-gold/20 text-cf-gold border-cf-gold/40",
  default: "bg-cf-surface text-cf-cream-dark border-cf-border",
};

export function gameBadgeVariant(game: string): BadgeVariant {
  const g = game.toLowerCase();
  if (g === "magic") return "magic";
  if (g === "pokemon") return "pokemon";
  if (g === "yugioh") return "yugioh";
  if (g === "sports") return "sports";
  return "other";
}

export function conditionBadgeVariant(cond: string): BadgeVariant {
  const c = cond.toLowerCase();
  if (c === "nm") return "nm";
  if (c === "lp") return "lp";
  if (c === "mp") return "mp";
  if (c === "hp") return "hp";
  if (c === "dmg") return "dmg";
  return "default";
}

export function gameLabel(game: string) {
  const labels: Record<string, string> = {
    MAGIC: "MTG",
    POKEMON: "Pokémon",
    YUGIOH: "Yu-Gi-Oh!",
    SPORTS: "Sports",
    OTHER: "Other",
  };
  return labels[game.toUpperCase()] ?? game;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        variantMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
