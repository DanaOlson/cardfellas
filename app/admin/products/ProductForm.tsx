"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const GAMES = [
  { value: "MAGIC", label: "Magic: The Gathering" },
  { value: "POKEMON", label: "Pokémon" },
  { value: "YUGIOH", label: "Yu-Gi-Oh!" },
  { value: "SPORTS", label: "Sports Cards" },
  { value: "OTHER", label: "Other" },
];

const CONDITIONS = [
  { value: "NM", label: "NM — Near Mint" },
  { value: "LP", label: "LP — Lightly Played" },
  { value: "MP", label: "MP — Moderately Played" },
  { value: "HP", label: "HP — Heavily Played" },
  { value: "DMG", label: "DMG — Damaged" },
];

export type ProductFormData = {
  id?: string;
  name: string;
  game: string;
  setName: string;
  setCode: string;
  condition: string;
  price: number;
  buyCashPrice: number | null;
  buyCreditPrice: number | null;
  quantity: number;
  isFoil: boolean;
  rarity: string;
  colorIdentity: string;
  imageUrl: string;
  isFeatured: boolean;
  isBuylistFeatured: boolean;
};

const EMPTY: ProductFormData = {
  name: "",
  game: "MAGIC",
  setName: "",
  setCode: "",
  condition: "NM",
  price: 0,
  buyCashPrice: null,
  buyCreditPrice: null,
  quantity: 1,
  isFoil: false,
  rarity: "",
  colorIdentity: "",
  imageUrl: "",
  isFeatured: false,
  isBuylistFeatured: false,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-cf-cream-dark text-xs mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2 text-cf-cream text-sm outline-none focus:border-cf-gold transition-colors";

const selectCls =
  "w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2 text-cf-cream text-sm outline-none focus:border-cf-gold transition-colors";

export function ProductForm({ initial }: { initial?: ProductFormData }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ProductFormData>(initial ?? EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        buyCashPrice: form.buyCashPrice !== null && form.buyCashPrice !== undefined && String(form.buyCashPrice) !== "" ? Number(form.buyCashPrice) : null,
        buyCreditPrice: form.buyCreditPrice !== null && form.buyCreditPrice !== undefined && String(form.buyCreditPrice) !== "" ? Number(form.buyCreditPrice) : null,
        quantity: Number(form.quantity),
        setCode: form.setCode || null,
        rarity: form.rarity || null,
        colorIdentity: form.colorIdentity || null,
        imageUrl: form.imageUrl || null,
      };
      const url = isEdit
        ? `/api/admin/products/${initial!.id}`
        : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save product.");
        setLoading(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-900/30 border border-red-600/40 rounded-lg px-4 py-2.5 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Core identity */}
      <div className="bg-cf-surface border border-cf-border rounded-xl p-5 space-y-4">
        <h3 className="font-display text-lg text-cf-cream">Card Details</h3>
        <Field label="Name *">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Black Lotus"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Game *">
            <select
              value={form.game}
              onChange={(e) => set("game", e.target.value)}
              className={selectCls}
            >
              {GAMES.map((g) => (
                <option key={g.value} value={g.value} className="bg-cf-darker">
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition *">
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              className={selectCls}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value} className="bg-cf-darker">
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Set Name *">
            <input
              type="text"
              required
              value={form.setName}
              onChange={(e) => set("setName", e.target.value)}
              placeholder="Alpha"
              className={inputCls}
            />
          </Field>
          <Field label="Set Code">
            <input
              type="text"
              value={form.setCode}
              onChange={(e) => set("setCode", e.target.value)}
              placeholder="LEA"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Rarity">
            <input
              type="text"
              value={form.rarity}
              onChange={(e) => set("rarity", e.target.value)}
              placeholder="Rare"
              className={inputCls}
            />
          </Field>
          <Field label="Color Identity (MTG)">
            <input
              type="text"
              value={form.colorIdentity}
              onChange={(e) => set("colorIdentity", e.target.value)}
              placeholder="W,U"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Image URL">
          <input
            type="text"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://cards.scryfall.io/..."
            className={inputCls}
          />
        </Field>
      </div>

      {/* Pricing & inventory */}
      <div className="bg-cf-surface border border-cf-border rounded-xl p-5 space-y-4">
        <h3 className="font-display text-lg text-cf-cream">Pricing & Inventory</h3>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Sell Price ($) *">
            <input
              type="number"
              required
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => set("price", e.target.valueAsNumber)}
              className={inputCls}
            />
          </Field>
          <Field label="Buy — Cash ($)">
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.buyCashPrice ?? ""}
              onChange={(e) =>
                set("buyCashPrice", e.target.value === "" ? null : e.target.valueAsNumber)
              }
              placeholder="—"
              className={inputCls}
            />
          </Field>
          <Field label="Buy — Credit ($)">
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.buyCreditPrice ?? ""}
              onChange={(e) =>
                set("buyCreditPrice", e.target.value === "" ? null : e.target.valueAsNumber)
              }
              placeholder="—"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Quantity *">
          <input
            type="number"
            required
            min={0}
            step={1}
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.valueAsNumber)}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Flags */}
      <div className="bg-cf-surface border border-cf-border rounded-xl p-5 space-y-3">
        <h3 className="font-display text-lg text-cf-cream">Flags</h3>
        {([
          ["isFoil", "Foil"],
          ["isFeatured", "Featured on homepage"],
          ["isBuylistFeatured", "Featured on buylist"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form[key] as boolean}
              onChange={(e) => set(key, e.target.checked)}
              className="w-4 h-4 accent-cf-gold"
            />
            <span className="text-cf-cream text-sm">{label}</span>
          </label>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="flex-1 border border-cf-border text-cf-cream-dark py-2.5 rounded-lg hover:border-cf-red hover:text-cf-red transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 bg-cf-red text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
