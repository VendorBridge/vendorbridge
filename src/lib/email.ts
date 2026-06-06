// ─────────────────────────────────────────────────────
// Email Utilities — VendorBridge
// For hackathon: logs to console instead of sending.
// Replace with Resend / Nodemailer in production.
// ─────────────────────────────────────────────────────

export interface SendVerificationEmailParams {
  to: string;
  firstName: string;
  token: string;
}

export async function sendVerificationEmail({
  to,
  firstName,
  token,
}: SendVerificationEmailParams): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  // ── DEMO: log to console ──────────────────────────
  console.log("┌─────────────────────────────────────────────────┐");
  console.log("│           VERIFICATION EMAIL (DEMO)              │");
  console.log("├─────────────────────────────────────────────────┤");
  console.log(`│ To:      ${to}`);
  console.log(`│ Name:    ${firstName}`);
  console.log(`│ Link:    ${verifyUrl}`);
  console.log("└─────────────────────────────────────────────────┘");

  // TODO (Production): Replace with actual email service
  // Example with Resend:
  // await resend.emails.send({
  //   from: "VendorBridge <noreply@vendorbridge.com>",
  //   to,
  //   subject: "Verify your VendorBridge account",
  //   html: `<p>Hello ${firstName},</p><p><a href="${verifyUrl}">Verify Email</a></p>`,
  // });
}

export interface SendPasswordResetEmailParams {
  to: string;
  firstName: string;
  resetToken: string;
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetToken,
}: SendPasswordResetEmailParams): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  console.log("┌─────────────────────────────────────────────────┐");
  console.log("│           PASSWORD RESET EMAIL (DEMO)            │");
  console.log("├─────────────────────────────────────────────────┤");
  console.log(`│ To:      ${to}`);
  console.log(`│ Name:    ${firstName}`);
  console.log(`│ Link:    ${resetUrl}`);
  console.log("└─────────────────────────────────────────────────┘");
}
