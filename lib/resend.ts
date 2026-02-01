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
export const EMAIL_FROM = "ApplyBetter <noreply@applybetter.com>";
export const EMAIL_REPLY_TO = "hello@applybetter.com";
