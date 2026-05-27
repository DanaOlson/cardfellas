import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CardFellas account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / heading */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cf-cream mb-1">Welcome Back</h1>
          <p className="text-cf-cream-dark text-sm">
            Sign in to your CardFellas account
          </p>
        </div>

        <div className="bg-cf-surface border border-cf-border rounded-xl p-6 sm:p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-cf-cream-dark text-sm mt-6">
          Don&rsquo;t have an account?{" "}
          <a href="/register" className="text-cf-gold hover:underline">
            Create one free
          </a>
        </p>
      </div>
    </div>
  );
}
