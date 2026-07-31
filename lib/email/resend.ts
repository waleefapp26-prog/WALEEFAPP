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
