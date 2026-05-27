"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge, gameBadgeVariant, gameLabel } from "@/components/ui/Badge";

type Product = {
  id: string;
  name: string;
  game: string;
  setName: string;
  condition: string;
  price: number;
  quantity: number;
  isFoil: boolean;
  isFeatured: boolean;
  isBuylistFeatured: boolean;
  buyCashPrice: number | null;
};

const CONDITION_COLOR: Record<string, string> = {
  NM: "text-emerald-400",
  LP: "text-yellow-400",
  MP: "text-orange-400",
  HP: "text-red-400",
  DMG: "text-red-600",
};

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="border border-cf-border rounded-xl p-10 text-center text-cf-cream-dark">
        No products found.
      </div>
    );
  }

  return (
    <div className="border border-cf-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cf-border bg-cf-darker">
            <th className="text-left px-4 py-3 text-cf-cream-dark font-medium">Name</th>
            <th className="text-left px-4 py-3 text-cf-cream-dark font-medium hidden md:table-cell">Set</th>
            <th className="text-left px-4 py-3 text-cf-cream-dark font-medium hidden sm:table-cell">Cond.</th>
            <th className="text-right px-4 py-3 text-cf-cream-dark font-medium">Price</th>
            <th className="text-right px-4 py-3 text-cf-cream-dark font-medium hidden sm:table-cell">Qty</th>
            <th className="text-center px-4 py-3 text-cf-cream-dark font-medium hidden lg:table-cell">Flags</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-cf-border">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-cf-darker/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant={gameBadgeVariant(p.game)} className="shrink-0 hidden sm:inline-flex">
                    {gameLabel(p.game)}
                  </Badge>
                  <span className="text-cf-cream font-medium truncate max-w-[160px]">
                    {p.name}
                  </span>
                  {p.isFoil && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30 shrink-0">
                      Foil
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-cf-cream-dark hidden md:table-cell">
                {p.setName}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className={`font-medium ${CONDITION_COLOR[p.condition] ?? "text-cf-cream-dark"}`}>
                  {p.condition}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-cf-gold font-bold">
                {formatPrice(p.price)}
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                <span className={p.quantity === 0 ? "text-red-400" : p.quantity <= 3 ? "text-yellow-400" : "text-cf-cream"}>
                  {p.quantity}
                </span>
              </td>
              <td className="px-4 py-3 text-center hidden lg:table-cell">
                <div className="flex items-center justify-center gap-1.5">
                  {p.isFeatured && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-cf-gold/10 text-cf-gold border border-cf-gold/30">
                      Featured
                    </span>
                  )}
                  {p.isBuylistFeatured && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-900/20 text-emerald-400 border border-emerald-700/30">
                      Buylist
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="p-1.5 text-cf-cream-dark hover:text-cf-gold transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deletingId === p.id}
                    className="p-1.5 text-cf-cream-dark hover:text-cf-red transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === p.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
