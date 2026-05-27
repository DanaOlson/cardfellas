import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Add Product" };

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-xs text-cf-cream-dark mb-2">
          <Link href="/admin/products" className="hover:text-cf-cream">Products</Link>
          <ChevronRight size={12} />
          <span className="text-cf-cream">New</span>
        </div>
        <h1 className="font-display text-4xl text-cf-cream">Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
