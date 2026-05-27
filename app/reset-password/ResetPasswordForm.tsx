"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="bg-cf-surface border border-red-700/40 rounded-xl p-8 text-center space-y-4">
        <AlertTriangle size={32} className="text-red-400 mx-auto" />
        <div>
          <p className="text-cf-cream font-medium">Invalid reset link</p>
          <p className="text-cf-cream-dark text-sm mt-1">
            This link is missing its token. Please request a new one.
          </p>
        </div>
        <Link href="/forgot-password" className="text-sm text-cf-gold hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-cf-surface border border-cf-border rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-900/30 border border-emerald-600/40 flex items-center justify-center mx-auto">
          <CheckCircle size={24} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-cf-cream font-medium">Password updated!</p>
          <p className="text-cf-cream-dark text-sm mt-1">
            Redirecting you to sign in…
          </p>
        </div>
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
          New password
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 pr-10 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cf-cream-dark hover:text-cf-cream transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-cf-cream-dark text-xs mb-1.5">
          Confirm new password
        </label>
        <input
          type={showPw ? "text" : "password"}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
        />
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
        {loading ? "Saving…" : "Set New Password"}
      </Button>
    </form>
  );
}
