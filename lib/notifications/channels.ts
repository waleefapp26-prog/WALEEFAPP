import { EMAIL_FROM, getResendClient } from "@/lib/email/resend";
import type { NotificationChannel } from "./types";

export const inAppChannel: NotificationChannel = {
  name: "in_app",
  async send() {
    // No-op: the notifications row is already persisted by the DB
    // trigger/RPC before dispatch ever runs. This exists so the channel
    // list is uniform to iterate over.
  },
};

export const emailChannel: NotificationChannel = {
  name: "email",
  async send(payload, recipient) {
    if (!recipient.email) return;
    try {
      await getResendClient().emails.send({
        from: EMAIL_FROM,
        to: recipient.email,
        subject: payload.title,
        html: `<p>${payload.title}</p>${payload.body ? `<p>${payload.body}</p>` : ""}`,
      });
    } catch (err) {
      console.error("Failed to send notification email", err);
    }
  },
};

export const pushChannel: NotificationChannel = {
  name: "push",
  async send() {
    // TODO(phase 4+): real Web Push needs a service worker + VAPID keys,
    // neither of which exist yet. Left as a no-op stub so the interface is
    // ready without pretending push notifications actually work today.
  },
};
