"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const GAMES = [
  { value: "", label: "— Any / Open —" },
  { value: "MAGIC", label: "Magic: The Gathering" },
  { value: "POKEMON", label: "Pokémon" },
  { value: "YUGIOH", label: "Yu-Gi-Oh!" },
  { value: "SPORTS", label: "Sports Cards" },
  { value: "OTHER", label: "Other" },
];

export type EventFormData = {
  id?: string;
  title: string;
  game: string;
  date: string;
  endTime: string;
  entryFee: number;
  format: string;
  description: string;
  registrationUrl: string;
  ageRestriction: string;
  isActive: boolean;
};

const EMPTY: EventFormData = {
  title: "",
  game: "",
  date: "",
  endTime: "",
  entryFee: 0,
  format: "",
  description: "",
  registrationUrl: "",
  ageRestriction: "",
  isActive: true,
};

function toLocalDatetimeValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputCls =
  "w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2 text-cf-cream text-sm outline-none focus:border-cf-gold transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-cf-cream-dark text-xs mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function EventForm({ initial }: { initial?: EventFormData }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<EventFormData>(
    initial
      ? { ...initial, date: toLocalDatetimeValue(initial.date), endTime: toLocalDatetimeValue(initial.endTime) }
      : EMPTY
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof EventFormData>(k: K, v: EventFormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        game: form.game || null,
        endTime: form.endTime || null,
        entryFee: Number(form.entryFee),
        format: form.format || null,
        description: form.description || null,
        registrationUrl: form.registrationUrl || null,
        ageRestriction: form.ageRestriction || null,
      };
      const url = isEdit ? `/api/admin/events/${initial!.id}` : "/api/admin/events";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save event.");
        setLoading(false);
        return;
      }
      router.push("/admin/events");
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

      <div className="bg-cf-surface border border-cf-border rounded-xl p-5 space-y-4">
        <h3 className="font-display text-lg text-cf-cream">Event Details</h3>

        <Field label="Title *">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Friday Night Magic"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Game">
            <select
              value={form.game}
              onChange={(e) => set("game", e.target.value)}
              className={inputCls}
            >
              {GAMES.map((g) => (
                <option key={g.value} value={g.value} className="bg-cf-darker">
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Format">
            <input
              type="text"
              value={form.format}
              onChange={(e) => set("format", e.target.value)}
              placeholder="Standard, Draft, etc."
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date & Time *">
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="End Time">
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => set("endTime", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Entry Fee ($)">
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.entryFee}
              onChange={(e) => set("entryFee", e.target.valueAsNumber)}
              className={inputCls}
            />
          </Field>
          <Field label="Age Restriction">
            <input
              type="text"
              value={form.ageRestriction}
              onChange={(e) => set("ageRestriction", e.target.value)}
              placeholder="All ages, 18+, etc."
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Event details, prizes, etc."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <Field label="Registration URL">
          <input
            type="text"
            value={form.registrationUrl}
            onChange={(e) => set("registrationUrl", e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="w-4 h-4 accent-cf-gold"
          />
          <span className="text-cf-cream text-sm">Active (visible on /play page)</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
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
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </form>
  );
}
