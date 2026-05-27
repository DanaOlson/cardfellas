import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Auth helper ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN" ? session : null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const rowSchema = z.object({
  name: z.string().min(1),
  setName: z.string(),
  setCode: z.string(),
  condition: z.enum(["NM", "LP", "MP", "HP", "DMG"]),
  quantity: z.number().int().min(1),
  isFoil: z.boolean(),
  scryfallId: z.string().optional(),
  rarity: z.string().optional(),
  collectorNumber: z.string().optional(),
  purchasePrice: z.number().optional(),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(5000),
  game: z.enum(["MAGIC", "POKEMON", "YUGIOH", "SPORTS", "OTHER"]),
  defaultPrice: z.number().min(0),
  fetchImages: z.boolean(),
  quantityMode: z.enum(["add", "replace"]),
});

type ParsedRow = z.infer<typeof rowSchema>;

// ─── Scryfall enrichment ──────────────────────────────────────────────────────

interface ScryfallCard {
  id: string;
  name: string;
  set: string;
  image_uris?: { normal?: string; large?: string; small?: string };
  card_faces?: Array<{ image_uris?: { normal?: string; large?: string } }>;
  color_identity: string[];
  rarity: string;
}

interface ScryfallIdentifier {
  id?: string;
  name?: string;
  set?: string;
}

/** Map from scryfallId (or "name|set") → enriched data */
type EnrichmentMap = Map<string, {
  imageUrl: string | null;
  colorIdentity: string | null;
  rarity: string | null;
}>;

async function fetchScryfallBatch(
  identifiers: ScryfallIdentifier[]
): Promise<{ data: ScryfallCard[]; not_found: ScryfallIdentifier[] }> {
  const res = await fetch("https://api.scryfall.com/cards/collection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifiers }),
  });
  if (!res.ok) {
    throw new Error(`Scryfall error ${res.status}`);
  }
  return res.json();
}

function pickImageUrl(card: ScryfallCard): string | null {
  // For double-faced cards use the front face
  if (!card.image_uris && card.card_faces?.[0]?.image_uris) {
    return (
      card.card_faces[0].image_uris.normal ??
      card.card_faces[0].image_uris.large ??
      null
    );
  }
  return card.image_uris?.normal ?? card.image_uris?.large ?? null;
}

async function enrichFromScryfall(rows: ParsedRow[]): Promise<EnrichmentMap> {
  const map: EnrichmentMap = new Map();
  const CHUNK = 75;

  // Build identifier list — prefer Scryfall ID when available
  const identifiers: ScryfallIdentifier[] = rows.map((r) =>
    r.scryfallId ? { id: r.scryfallId } : { name: r.name, set: r.setCode || undefined }
  );

  // Deduplicate by serialized identifier so we don't hammer Scryfall with duplicates
  const unique = new Map<string, ScryfallIdentifier>();
  identifiers.forEach((ident) => {
    const key = ident.id ?? `${ident.name}|${ident.set ?? ""}`;
    unique.set(key, ident);
  });
  const uniqueList = Array.from(unique.values());

  // Chunk into batches of 75
  for (let i = 0; i < uniqueList.length; i += CHUNK) {
    const batch = uniqueList.slice(i, i + CHUNK);
    try {
      const result = await fetchScryfallBatch(batch);
      for (const card of result.data) {
        const enriched = {
          imageUrl: pickImageUrl(card),
          colorIdentity: card.color_identity.length ? card.color_identity.join("") : "C",
          rarity: card.rarity ?? null,
        };
        // Store by both ID and name|set so lookup works regardless of which identifier was used
        map.set(card.id, enriched);
        map.set(`${card.name.toLowerCase()}|${card.set}`, enriched);
      }
    } catch {
      // Non-fatal: skip enrichment for this batch; import continues without images
    }
    // Respect Scryfall's rate limit (10 req/s recommended)
    if (i + CHUNK < uniqueList.length) {
      await new Promise((r) => setTimeout(r, 110));
    }
  }

  return map;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { rows, game, defaultPrice, fetchImages, quantityMode } = parsed.data;

  // ── Optionally enrich from Scryfall ─────────────────────────────────────────
  let enrichment: EnrichmentMap = new Map();
  if (fetchImages && game === "MAGIC") {
    enrichment = await enrichFromScryfall(rows);
  }

  // ── Upsert each row ──────────────────────────────────────────────────────────
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      // Look up enrichment by Scryfall ID, then by name|set
      const enrichKey =
        row.scryfallId ?? `${row.name.toLowerCase()}|${row.setCode}`;
      const e = enrichment.get(enrichKey) ??
        enrichment.get(`${row.name.toLowerCase()}|${row.setCode}`) ??
        null;

      // Find existing product by natural key
      const existing = await prisma.product.findFirst({
        where: {
          name: { equals: row.name, mode: "insensitive" },
          game,
          setCode: row.setCode || null,
          condition: row.condition,
          isFoil: row.isFoil,
        },
        select: { id: true, quantity: true },
      });

      if (existing) {
        const newQty =
          quantityMode === "add"
            ? existing.quantity + row.quantity
            : row.quantity;

        await prisma.product.update({
          where: { id: existing.id },
          data: {
            quantity: newQty,
            // Update enrichment fields if we got fresh data
            ...(e?.imageUrl != null && { imageUrl: e.imageUrl }),
            ...(e?.colorIdentity != null && { colorIdentity: e.colorIdentity }),
            ...(e?.rarity != null && { rarity: e.rarity }),
            // Update setName in case it was blank / different
            ...(row.setName && { setName: row.setName }),
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            name: row.name,
            game,
            setName: row.setName || "Unknown",
            setCode: row.setCode || null,
            condition: row.condition,
            price: defaultPrice,
            quantity: row.quantity,
            isFoil: row.isFoil,
            rarity: e?.rarity ?? row.rarity ?? null,
            colorIdentity: e?.colorIdentity ?? null,
            imageUrl: e?.imageUrl ?? null,
          },
        });
        created++;
      }
    } catch (err) {
      skipped++;
      errors.push(
        `"${row.name}" (${row.setCode}, ${row.condition}): ${
          err instanceof Error ? err.message : "unknown error"
        }`
      );
    }
  }

  return NextResponse.json({ created, updated, skipped, errors });
}
