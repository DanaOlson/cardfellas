import type { Metadata } from "next";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your CardFellas account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cf-cream mb-2">Forgot Password</h1>
          <p className="text-cf-cream-dark text-sm">
            Enter your email and we&rsquo;ll send you a reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
