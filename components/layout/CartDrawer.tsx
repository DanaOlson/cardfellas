"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { state, removeItem, updateQuantity, clearCart, toggleCart, subtotal, itemCount } =
    useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  if (!state.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => toggleCart(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-cf-surface border-l border-cf-border flex flex-col animate-slide-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cf-border">
          <div>
            <h2 className="font-display text-2xl text-cf-cream">Your Cart</h2>
            {itemCount > 0 && (
              <p className="text-cf-cream-dark text-xs mt-0.5">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button
            onClick={() => toggleCart(false)}
            className="text-cf-cream-dark hover:text-cf-cream transition-colors"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-cf-border" />
              <div>
                <p className="text-cf-cream font-medium">Your cart is empty</p>
                <p className="text-cf-cream-dark text-sm mt-1">
                  Browse our shop to find cards
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => toggleCart(false)}
                asChild
              >
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {state.items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex gap-3 pb-4 border-b border-cf-border last:border-0"
                >
                  {/* Image */}
                  <div className="w-14 h-20 shrink-0 relative rounded overflow-hidden bg-cf-darker">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cf-border to-cf-darker flex items-center justify-center">
                        <ShoppingBag size={20} className="text-cf-border" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-cf-cream text-sm font-medium leading-tight truncate">
                      {product.name}
                    </p>
                    <p className="text-cf-cream-dark text-xs mt-0.5">
                      {product.setName} · {product.condition}
                    </p>
                    <p className="text-cf-gold font-semibold text-sm mt-1">
                      {formatPrice(product.price * quantity)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded border border-cf-border text-cf-cream-dark hover:border-cf-red hover:text-cf-red transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-cf-cream text-sm w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(product.id, quantity + 1)
                        }
                        disabled={quantity >= product.quantity}
                        className="w-7 h-7 flex items-center justify-center rounded border border-cf-border text-cf-cream-dark hover:border-cf-red hover:text-cf-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="ml-auto text-cf-cream-dark hover:text-cf-red transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-cf-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-cf-cream">
              <span className="text-sm text-cf-cream-dark">Subtotal</span>
              <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-cf-cream-dark">
              In-store pickup only · 1596 N Hill Field Rd, Layton, UT
            </p>
            <Button variant="primary" size="lg" className="w-full" asChild>
              <Link href="/checkout" onClick={() => toggleCart(false)}>
                Continue to Checkout
              </Link>
            </Button>
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full text-xs text-cf-cream-dark hover:text-cf-red transition-colors py-1"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>

      {/* Clear Cart confirmation modal */}
      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear Cart?"
      >
        <p className="text-cf-cream-dark text-sm mb-6">
          This will remove all {itemCount} item{itemCount !== 1 ? "s" : ""}{" "}
          from your cart. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirmClear(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              clearCart();
              setConfirmClear(false);
            }}
          >
            Clear Cart
          </Button>
        </div>
      </Modal>
    </>
  );
}
