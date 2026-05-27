export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(amount: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export function formatGame(game: string): string {
  const map: Record<string, string> = {
    MAGIC: "Magic: The Gathering",
    POKEMON: "Pokémon TCG",
    YUGIOH: "Yu-Gi-Oh!",
    SPORTS: "Sports Cards",
    OTHER: "Other",
  };
  return map[game] ?? game;
}

export function slugToGame(slug: string): string {
  const map: Record<string, string> = {
    magic: "MAGIC",
    pokemon: "POKEMON",
    yugioh: "YUGIOH",
    sports: "SPORTS",
    other: "OTHER",
  };
  return map[slug] ?? slug.toUpperCase();
}

export function gameToSlug(game: string): string {
  const map: Record<string, string> = {
    MAGIC: "magic",
    POKEMON: "pokemon",
    YUGIOH: "yugioh",
    SPORTS: "sports",
    OTHER: "other",
  };
  return map[game] ?? game.toLowerCase();
}
