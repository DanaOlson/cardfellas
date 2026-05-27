"use client";

import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Condition = "NM" | "LP" | "MP" | "HP" | "DMG";
type Game = "MAGIC" | "POKEMON" | "YUGIOH" | "SPORTS" | "OTHER";

interface ParsedRow {
  name: string;
  setName: string;
  setCode: string;
  condition: Condition;
  quantity: number;
  isFoil: boolean;
  scryfallId?: string;
  rarity?: string;
  collectorNumber?: string;
  purchasePrice?: number;
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// ─── Manabox column mapping ───────────────────────────────────────────────────

const CONDITION_MAP: Record<string, Condition> = {
  M: "NM", MINT: "NM",
  NM: "NM", "NEAR MINT": "NM",
  LP: "LP", "LIGHTLY PLAYED": "LP",
  MP: "MP", "MODERATELY PLAYED": "MP",
  HP: "HP", "HEAVILY PLAYED": "HP",
  DMG: "DMG", DAMAGED: "DMG", D: "DMG", PO: "DMG", POOR: "DMG",
};

function normaliseCondition(raw: string): Condition {
  return CONDITION_MAP[raw?.trim().toUpperCase()] ?? "NM";
}

function normaliseFoil(raw: string): boolean {
  const v = raw?.trim().toLowerCase();
  return v === "true" || v === "yes" || v === "foil" || v === "1";
}

function isManaboxFormat(headers: string[]): boolean {
  const h = headers.map((s) => s.trim().toLowerCase());
  return h.includes("scryfall id") || h.includes("manabox id") || (h.includes("name") && h.includes("set code") && h.includes("quantity"));
}

function parseRows(data: Record<string, string>[]): ParsedRow[] {
  return data
    .filter((row) => {
      const name = row["Name"] ?? row["name"] ?? "";
      return name.trim().length > 0;
    })
    .map((row) => {
      const get = (...keys: string[]) => {
        for (const k of keys) {
          const v = row[k] ?? row[k.toLowerCase()] ?? "";
          if (v) return v.trim();
        }
        return "";
      };

      return {
        name: get("Name", "name", "Card Name"),
        setName: get("Set Name", "set name", "Set", "Edition"),
        setCode: get("Set Code", "set code", "Edition Code").toLowerCase(),
        condition: normaliseCondition(get("Condition", "condition")),
        quantity: Math.max(1, parseInt(get("Quantity", "quantity", "Count", "count") || "1", 10) || 1),
        isFoil: normaliseFoil(get("Foil", "foil")),
        scryfallId: get("Scryfall ID", "scryfall id") || undefined,
        rarity: get("Rarity", "rarity") || undefined,
        collectorNumber: get("Collector Number", "collector number") || undefined,
        purchasePrice: parseFloat(get("Purchase Price", "purchase price")) || undefined,
      };
    });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors",
        dragging
          ? "border-cf-gold bg-cf-gold/10"
          : "border-cf-border hover:border-cf-gold/50 hover:bg-cf-surface/60"
      )}
    >
      <Upload size={32} className="text-cf-gold" />
      <div className="text-center">
        <p className="text-cf-cream font-medium">Drop a CSV file here</p>
        <p className="text-cf-cream-dark text-sm mt-1">
          Manabox export or any CSV with Name, Set, Condition, Quantity columns
        </p>
      </div>
      <span className="text-xs text-cf-cream-dark border border-cf-border rounded px-3 py-1">
        Browse file
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImportClient() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isManabox, setIsManabox] = useState(false);
  const [parseError, setParseError] = useState("");

  // Settings
  const [game, setGame] = useState<Game>("MAGIC");
  const [defaultPrice, setDefaultPrice] = useState("0.00");
  const [fetchImages, setFetchImages] = useState(true);
  const [quantityMode, setQuantityMode] = useState<"add" | "replace">("add");

  // Import state
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");

  const handleFile = useCallback((file: File) => {
    setParseError("");
    setResult(null);
    setImportError("");
    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(res) {
        if (res.errors.length && !res.data.length) {
          setParseError("Could not parse CSV. Make sure it's a valid CSV file.");
          return;
        }
        const detected = isManaboxFormat(res.meta.fields ?? []);
        setIsManabox(detected);
        if (detected) setGame("MAGIC");
        const parsed = parseRows(res.data);
        if (!parsed.length) {
          setParseError("No card rows found. Check the file has a Name column.");
          return;
        }
        setRows(parsed);
      },
      error() {
        setParseError("Failed to read file.");
      },
    });
  }, []);

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    setImportError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows,
          game,
          defaultPrice: parseFloat(defaultPrice) || 0,
          fetchImages: fetchImages && game === "MAGIC",
          quantityMode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "Import failed.");
      } else {
        setResult(data);
        setRows([]);
        setFileName("");
      }
    } catch {
      setImportError("Network error. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const foilCount = rows.filter((r) => r.isFoil).length;
  const setCount = new Set(rows.map((r) => r.setName)).size;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-4xl text-cf-cream">Import Products</h1>
        <p className="text-cf-cream-dark text-sm mt-1">
          Upload a Manabox CSV export or any standard TCG inventory spreadsheet.
        </p>
      </div>

      {/* Format guide */}
      <div className="bg-cf-surface border border-cf-border rounded-xl p-4 text-sm space-y-2">
        <p className="text-cf-cream font-medium flex items-center gap-2">
          <FileText size={15} className="text-cf-gold" /> Supported formats
        </p>
        <ul className="text-cf-cream-dark space-y-1 pl-5 list-disc text-xs leading-relaxed">
          <li>
            <span className="text-cf-cream font-medium">Manabox</span> — In the app go to{" "}
            <span className="text-cf-cream">Collection → ⋯ → Export CSV</span>. Includes
            Scryfall IDs for automatic image fetching.
          </li>
          <li>
            <span className="text-cf-cream font-medium">Generic CSV</span> — Any spreadsheet
            with columns: <code className="text-cf-gold">Name</code>,{" "}
            <code className="text-cf-gold">Set Name</code>,{" "}
            <code className="text-cf-gold">Condition</code>,{" "}
            <code className="text-cf-gold">Quantity</code>. Foil and Set Code are optional.
          </li>
          <li>
            Conditions accepted: NM, LP, MP, HP, DMG (case-insensitive; Mint maps to NM).
          </li>
        </ul>
      </div>

      {/* Drop zone */}
      {!rows.length && !result && (
        <DropZone onFile={handleFile} />
      )}

      {parseError && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3">
          <AlertTriangle size={15} /> {parseError}
        </div>
      )}

      {/* File parsed — settings + preview */}
      {rows.length > 0 && (
        <>
          {/* File summary */}
          <div className="flex items-center justify-between bg-cf-surface border border-cf-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-cf-gold shrink-0" />
              <div>
                <p className="text-cf-cream text-sm font-medium">{fileName}</p>
                <p className="text-cf-cream-dark text-xs">
                  {rows.length} card{rows.length !== 1 ? "s" : ""} · {setCount} set
                  {setCount !== 1 ? "s" : ""}
                  {foilCount > 0 && ` · ${foilCount} foil`}
                  {isManabox && (
                    <span className="ml-2 text-cf-gold">✓ Manabox format detected</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setRows([]); setFileName(""); setParseError(""); }}
              className="text-cf-cream-dark hover:text-cf-red transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Import settings */}
          <div className="bg-cf-surface border border-cf-border rounded-xl p-5 space-y-4">
            <h2 className="font-display text-xl text-cf-cream">Import Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Game */}
              <div>
                <label className="block text-cf-cream-dark text-xs mb-1.5">Game</label>
                <div className="relative">
                  <select
                    value={game}
                    onChange={(e) => setGame(e.target.value as Game)}
                    className="w-full appearance-none bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream text-sm outline-none focus:border-cf-gold transition-colors pr-8"
                  >
                    <option value="MAGIC">Magic: The Gathering</option>
                    <option value="POKEMON">Pokémon TCG</option>
                    <option value="YUGIOH">Yu-Gi-Oh!</option>
                    <option value="SPORTS">Sports Cards</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cf-cream-dark pointer-events-none" />
                </div>
              </div>

              {/* Default sell price */}
              <div>
                <label className="block text-cf-cream-dark text-xs mb-1.5">
                  Default sell price
                  <span className="ml-1 text-cf-border">(set to $0 to price later)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cf-cream-dark text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(e.target.value)}
                    className="w-full bg-cf-darker border border-cf-border rounded-lg pl-7 pr-3 py-2.5 text-cf-cream text-sm outline-none focus:border-cf-gold transition-colors"
                  />
                </div>
              </div>

              {/* Quantity mode */}
              <div>
                <label className="block text-cf-cream-dark text-xs mb-1.5">
                  If card already exists
                </label>
                <div className="relative">
                  <select
                    value={quantityMode}
                    onChange={(e) => setQuantityMode(e.target.value as "add" | "replace")}
                    className="w-full appearance-none bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream text-sm outline-none focus:border-cf-gold transition-colors pr-8"
                  >
                    <option value="add">Add to existing quantity</option>
                    <option value="replace">Replace quantity</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cf-cream-dark pointer-events-none" />
                </div>
              </div>

              {/* Fetch images */}
              {game === "MAGIC" && (
                <div className="flex items-start gap-3 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setFetchImages((v) => !v)}
                      className={cn(
                        "w-10 h-6 rounded-full relative transition-colors cursor-pointer",
                        fetchImages ? "bg-cf-gold" : "bg-cf-border"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                        fetchImages ? "translate-x-5" : "translate-x-1"
                      )} />
                    </div>
                    <div>
                      <p className="text-cf-cream text-sm">Fetch card images from Scryfall</p>
                      <p className="text-cf-cream-dark text-xs">
                        Uses Scryfall ID or card name to fill in images automatically
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-cf-surface border border-cf-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-cf-border">
              <p className="text-cf-cream text-sm font-medium">
                Preview <span className="text-cf-cream-dark font-normal">(first 10 rows)</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-cf-border text-cf-cream-dark uppercase tracking-wide">
                    <th className="text-left px-4 py-2 font-medium">Name</th>
                    <th className="text-left px-4 py-2 font-medium">Set</th>
                    <th className="text-left px-4 py-2 font-medium">Cond.</th>
                    <th className="text-center px-4 py-2 font-medium">Foil</th>
                    <th className="text-center px-4 py-2 font-medium">Qty</th>
                    {isManabox && <th className="text-left px-4 py-2 font-medium">Scryfall ID</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cf-border">
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-cf-darker/40">
                      <td className="px-4 py-2 text-cf-cream max-w-[200px] truncate">{row.name}</td>
                      <td className="px-4 py-2 text-cf-cream-dark">
                        {row.setCode ? `${row.setCode.toUpperCase()} — ` : ""}{row.setName || "—"}
                      </td>
                      <td className="px-4 py-2 text-cf-cream-dark">{row.condition}</td>
                      <td className="px-4 py-2 text-center">
                        {row.isFoil ? <span className="text-cf-gold">✦</span> : <span className="text-cf-border">—</span>}
                      </td>
                      <td className="px-4 py-2 text-center text-cf-cream">{row.quantity}</td>
                      {isManabox && (
                        <td className="px-4 py-2 text-cf-border font-mono">
                          {row.scryfallId ? row.scryfallId.slice(0, 8) + "…" : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 10 && (
              <p className="px-4 py-2 text-cf-cream-dark text-xs border-t border-cf-border">
                … and {rows.length - 10} more row{rows.length - 10 !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {importError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3">
              <AlertTriangle size={15} /> {importError}
            </div>
          )}

          {parseFloat(defaultPrice) === 0 && (
            <div className="flex items-center gap-2 text-yellow-400 text-xs bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-3 py-2">
              <AlertTriangle size={13} />
              Default price is $0.00 — imported cards will not appear in the shop until you set
              their prices on the Products page.
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 bg-cf-red text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {importing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Importing{fetchImages && game === "MAGIC" ? " & fetching images…" : "…"}
              </>
            ) : (
              <>
                <Upload size={16} />
                Import {rows.length} card{rows.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
          {importing && fetchImages && game === "MAGIC" && (
            <p className="text-cf-cream-dark text-xs">
              Scryfall image lookup may take a moment for large imports — please wait.
            </p>
          )}
        </>
      )}

      {/* Result */}
      {result && (
        <div className="bg-cf-surface border border-emerald-600/40 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-400" />
            <h2 className="font-display text-2xl text-cf-cream">Import complete</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-cf-darker rounded-lg py-3">
              <p className="font-display text-3xl text-emerald-400">{result.created}</p>
              <p className="text-cf-cream-dark text-xs mt-0.5">New products</p>
            </div>
            <div className="bg-cf-darker rounded-lg py-3">
              <p className="font-display text-3xl text-blue-400">{result.updated}</p>
              <p className="text-cf-cream-dark text-xs mt-0.5">Updated</p>
            </div>
            <div className="bg-cf-darker rounded-lg py-3">
              <p className="font-display text-3xl text-cf-cream-dark">{result.skipped}</p>
              <p className="text-cf-cream-dark text-xs mt-0.5">Skipped</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="text-xs text-yellow-400 space-y-1">
              <p className="font-medium">Warnings ({result.errors.length}):</p>
              {result.errors.slice(0, 5).map((e, i) => (
                <p key={i} className="text-yellow-400/70">{e}</p>
              ))}
              {result.errors.length > 5 && (
                <p className="text-yellow-400/50">…and {result.errors.length - 5} more</p>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setResult(null)}
              className="text-sm text-cf-cream-dark hover:text-cf-cream transition-colors"
            >
              Import another file
            </button>
            <a
              href="/admin/products"
              className="text-sm text-cf-gold hover:underline"
            >
              View products →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
