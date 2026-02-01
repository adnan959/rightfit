import { createHash } from "crypto";

// Secret for token generation - should be set in environment
const TOKEN_SECRET = process.env.ORDER_TOKEN_SECRET || "applybetter-order-token-secret-2024";

/**
 * Generate a secure token for order access
 * Token is a SHA256 hash of orderId + email + secret
 */
export function generateOrderToken(orderId: string, email: string): string {
  const data = `${orderId}:${email.toLowerCase()}:${TOKEN_SECRET}`;
  return createHash("sha256").update(data).digest("hex").slice(0, 32);
}

/**
 * Verify an order token
 */
export function verifyOrderToken(orderId: string, email: string, token: string): boolean {
  const expectedToken = generateOrderToken(orderId, email);
  return token === expectedToken;
}

/**
 * Generate the full order URL with token
 */
export function generateOrderUrl(orderId: string, email: string, baseUrl?: string): string {
  const token = generateOrderToken(orderId, email);
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://applybetter.com";
  return `${base}/order/${orderId}?token=${token}`;
}
