import { Resend } from "resend";

// Resend client — requires RESEND_API_KEY in .env
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "CardFellas <no-reply@cardfellas.com>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your CardFellas password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#181008;color:#F5F0E8;border-radius:12px">
        <h1 style="font-size:28px;margin:0 0 8px;color:#F5F0E8">Reset your password</h1>
        <p style="color:#d8cfc0;font-size:14px;margin:0 0 24px;line-height:1.6">
          You requested a password reset for your CardFellas account.
          Click the button below to set a new password. This link expires in <strong style="color:#F5F0E8">1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#C62828;color:#fff;font-weight:600;font-size:14px;
                  padding:12px 28px;border-radius:8px;text-decoration:none;margin-bottom:24px">
          Reset Password
        </a>
        <p style="color:#d8cfc0;font-size:12px;margin:0;line-height:1.6">
          If you didn't request this, you can safely ignore this email.
          Your password won't change unless you click the link above.
        </p>
        <hr style="border:none;border-top:1px solid #3a2418;margin:24px 0"/>
        <p style="color:#3a2418;font-size:11px;margin:0">
          CardFellas · 1596 N Hill Field Rd, Suite B, Layton, UT 84041
        </p>
      </div>
    `,
  });
}
