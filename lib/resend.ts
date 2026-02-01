import { Resend } from "resend";

// Lazy initialization to avoid build errors when env vars aren't set
let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

// Email sender configuration
// Use custom domain if configured, otherwise fall back to Resend's default
// To use custom domain, add RESEND_FROM_EMAIL to your environment variables
// IMPORTANT: Custom domains must be verified in Resend dashboard first
export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || "ApplyBetter <onboarding@resend.dev>";
export const EMAIL_REPLY_TO = process.env.RESEND_REPLY_TO || "hello@applybetter.com";
