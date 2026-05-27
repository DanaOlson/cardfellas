"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-cf-surface border border-cf-border rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-600/40 flex items-center justify-center mx-auto">
          <CheckCircle size={24} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-cf-cream font-medium">Check your email</h2>
          <p className="text-cf-cream-dark text-sm mt-2">
            If <span className="text-cf-cream">{email}</span> has an account,
            you&rsquo;ll receive a reset link shortly. Check your spam folder if
            you don&rsquo;t see it.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-cf-cream-dark hover:text-cf-cream transition-colors"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cf-surface border border-cf-border rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-cf-cream-dark text-xs mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cf-cream-dark"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-cf-darker border border-cf-border rounded-lg pl-9 pr-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Sending…" : "Send Reset Link"}
      </Button>

      <p className="text-center text-xs text-cf-cream-dark">
        Remember it?{" "}
        <Link href="/login" className="text-cf-gold hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
