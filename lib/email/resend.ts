import { Resend } from "resend";

let client: Resend | null = null;

// Lazily constructed so importing this module never crashes when
// RESEND_API_KEY isn't set yet (e.g. local dev before setup, or tests) --
// the error only surfaces if something actually tries to send an email.
export function getResendClient(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

/** Whether email can be sent at all.
 *
 *  Callers need this because "we couldn't email your guardian" and "we emailed
 *  your guardian" are very different things to tell a user, and every send
 *  site used to catch the missing-key error and report success regardless. */
export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
