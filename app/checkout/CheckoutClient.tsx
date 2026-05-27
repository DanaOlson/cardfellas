"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, MapPin, Phone, Check, ChevronRight, Trash2 } from "lucide-react";
import Image from "next/image";

type Step = "cart" | "contact" | "confirm";

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  pickupNote: string;
}

export function CheckoutClient() {
  const { state, removeItem, clearCart, subtotal } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [contact, setContact] = useState<ContactInfo>({
    name: "",
    email: "",
    phone: "",
    pickupNote: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  const STEPS: { key: Step; label: string }[] = [
    { key: "cart", label: "Cart" },
    { key: "contact", label: "Pickup Info" },
    { key: "confirm", label: "Confirmed" },
  ];

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const [submitError, setSubmitError] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
          contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setOrderRef(data.ref);
      clearCart();
      setStep("confirm");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (state.items.length === 0 && step !== "confirm") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-cf-border mx-auto mb-4" />
        <h1 className="font-display text-3xl text-cf-cream mb-2">Your cart is empty</h1>
        <p className="text-cf-cream-dark text-sm mb-6">
          Add some cards before checking out.
        </p>
        <a
          href="/shop"
          className="inline-block bg-cf-red text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
        >
          Browse the Shop
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl text-cf-cream mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                i < stepIndex
                  ? "bg-cf-gold border-cf-gold text-cf-dark"
                  : i === stepIndex
                  ? "border-cf-gold text-cf-gold"
                  : "border-cf-border text-cf-cream-dark"
              }`}
            >
              {i < stepIndex ? <Check size={13} /> : i + 1}
            </div>
            <span
              className={`text-sm ${
                i === stepIndex ? "text-cf-cream font-medium" : "text-cf-cream-dark"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="text-cf-border ml-1" />
            )}
          </div>
        ))}
      </div>

      {/* Step: Cart review */}
      {step === "cart" && (
        <div className="space-y-4">
          <div className="bg-cf-surface border border-cf-border rounded-xl overflow-hidden">
            <div className="divide-y divide-cf-border">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4">
                  <div className="w-12 h-16 relative rounded overflow-hidden bg-cf-darker shrink-0">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-cf-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cf-cream text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-cf-cream-dark text-xs">{item.product.setName}</p>
                    <p className="text-cf-gold font-bold text-sm mt-1">
                      {formatPrice(item.product.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <span className="text-cf-cream text-sm font-bold">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-cf-cream-dark hover:text-cf-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-cf-border px-4 py-3 flex justify-between">
              <span className="text-cf-cream-dark text-sm">Subtotal</span>
              <span className="text-cf-gold font-bold">{formatPrice(subtotal)}</span>
            </div>
          </div>

          {/* Local pickup note */}
          <div className="bg-cf-surface border border-cf-border rounded-xl p-4 flex gap-3">
            <MapPin size={18} className="text-cf-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-cf-cream text-sm font-medium">In-Store Pickup Only</p>
              <p className="text-cf-cream-dark text-xs mt-0.5">
                We&rsquo;ll hold your items for 48 hours after confirmation. Pick up at
                1596 N Hill Field Rd, Suite B, Layton, UT 84041.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep("contact")}
            className="w-full bg-cf-red text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue to Pickup Info
          </button>
        </div>
      )}

      {/* Step: Contact/pickup info */}
      {step === "contact" && (
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="bg-cf-surface border border-cf-border rounded-xl p-5 space-y-4">
            <h2 className="font-display text-2xl text-cf-cream">Pickup Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-cf-cream-dark text-xs mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-cf-cream-dark text-xs mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-cf-cream-dark text-xs mb-1.5">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                placeholder="(385) 555-1234"
                className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-cf-cream-dark text-xs mb-1.5">
                Pickup preference / notes (optional)
              </label>
              <textarea
                rows={3}
                value={contact.pickupNote}
                onChange={(e) => setContact((c) => ({ ...c, pickupNote: e.target.value }))}
                placeholder="e.g. I'll be in Saturday afternoon"
                className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors resize-none"
              />
            </div>

            {/* Order summary */}
            <div className="border-t border-cf-border pt-4 flex justify-between">
              <span className="text-cf-cream-dark text-sm">Total due in-store</span>
              <span className="text-cf-gold font-bold">{formatPrice(subtotal)}</span>
            </div>
          </div>

          {submitError && (
            <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-2.5">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="flex-1 border border-cf-border text-cf-cream-dark py-2.5 rounded-lg hover:border-cf-red hover:text-cf-red transition-colors text-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-cf-red text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Order Request"}
            </button>
          </div>
        </form>
      )}

      {/* Step: Confirmation */}
      {step === "confirm" && (
        <div className="bg-cf-surface border border-emerald-600/40 rounded-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-900/30 border border-emerald-600/40 flex items-center justify-center mx-auto">
            <Check size={28} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="font-display text-3xl text-cf-cream mb-1">Order Submitted!</h2>
            <p className="text-cf-cream-dark text-sm">
              Reference #{orderRef}
            </p>
          </div>
          <p className="text-cf-cream-dark text-sm max-w-sm mx-auto">
            We&rsquo;ll hold your items for 48 hours. Come pick them up at{" "}
            <span className="text-cf-cream">1596 N Hill Field Rd, Suite B, Layton, UT</span>{" "}
            during store hours.
          </p>
          <div className="flex items-center justify-center gap-2 text-cf-cream-dark text-sm">
            <Phone size={14} className="text-cf-gold" />
            <span>Questions? Call us at (385) 348-2682</span>
          </div>
          <a
            href="/shop"
            className="inline-block mt-2 bg-cf-gold text-cf-dark font-semibold px-6 py-2.5 rounded-lg hover:bg-cf-gold-light transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      )}
    </div>
  );
}
