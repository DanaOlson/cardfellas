import type { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your cart and place your order at CardFellas.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
