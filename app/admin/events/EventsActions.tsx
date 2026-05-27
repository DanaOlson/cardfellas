"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";

export function EventsActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(false);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/events/${id}/edit`}
        className="p-1.5 text-cf-cream-dark hover:text-cf-gold transition-colors"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 text-cf-cream-dark hover:text-cf-red transition-colors disabled:opacity-50"
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  );
}
