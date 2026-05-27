"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setLoading(false);
        return;
      }
      // Auto sign-in
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-600/40 rounded-lg px-4 py-2.5 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-cf-cream-dark text-xs mb-1.5">First name</label>
          <input
            type="text"
            value={form.firstName}
            onChange={set("firstName")}
            required
            autoComplete="given-name"
            placeholder="Jane"
            className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
          />
        </div>
        <div>
          <label className="block text-cf-cream-dark text-xs mb-1.5">Last name</label>
          <input
            type="text"
            value={form.lastName}
            onChange={set("lastName")}
            required
            autoComplete="family-name"
            placeholder="Doe"
            className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-cf-cream-dark text-xs mb-1.5">Email address</label>
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
        />
      </div>

      <div>
        <label className="block text-cf-cream-dark text-xs mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            required
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 pr-10 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cf-cream-dark hover:text-cf-cream"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-cf-cream-dark text-xs mb-1.5">Confirm password</label>
        <input
          type={showPw ? "text" : "password"}
          value={form.confirm}
          onChange={set("confirm")}
          required
          autoComplete="new-password"
          placeholder="Repeat password"
          className="w-full bg-cf-darker border border-cf-border rounded-lg px-3 py-2.5 text-cf-cream placeholder-cf-cream-dark/50 text-sm outline-none focus:border-cf-gold transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-cf-red text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-cf-cream-dark text-xs">
        By creating an account you agree to our{" "}
        <a href="#" className="text-cf-gold hover:underline">
          Terms of Service
        </a>
        .
      </p>
    </form>
  );
}
