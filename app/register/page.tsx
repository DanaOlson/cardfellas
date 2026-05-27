import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free CardFellas account to track orders and manage your wishlist.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cf-cream mb-1">Create Account</h1>
          <p className="text-cf-cream-dark text-sm">
            Join CardFellas — free, takes 30 seconds
          </p>
        </div>

        <div className="bg-cf-surface border border-cf-border rounded-xl p-6 sm:p-8">
          <RegisterForm />
        </div>

        <p className="text-center text-cf-cream-dark text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-cf-gold hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
