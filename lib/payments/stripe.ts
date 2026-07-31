import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Lazily constructed so importing this module never crashes when
 * STRIPE_SECRET_KEY isn't set yet (local dev before setup, or tests) -- the
 * error only surfaces if something actually tries to reach Stripe. Same
 * pattern as lib/email/resend.ts.
 */
export function getStripeClient(): Stripe {
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
