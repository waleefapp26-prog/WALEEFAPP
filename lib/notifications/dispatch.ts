import { emailChannel, inAppChannel, pushChannel } from "./channels";
import type { NotificationChannel, NotificationPayload, NotificationRecipient, NotificationType } from "./types";

const ALL_CHANNELS: NotificationChannel[] = [inAppChannel, emailChannel, pushChannel];

// Infrequent, high-value events get emailed. new_message/profile_like would
// be spammy to email on every occurrence, so they stay in-app + push only.
const EMAIL_ELIGIBLE_TYPES: NotificationType[] = [
  "new_match",
  "wali_status_change",
  "verification_status_change",
  "payment_event",
  "high_compatibility_match",
  "profile_completion_reminder",
];

export function resolveChannelsForType(type: NotificationType): NotificationChannel["name"][] {
  return EMAIL_ELIGIBLE_TYPES.includes(type) ? ["in_app", "email", "push"] : ["in_app", "push"];
}

export async function dispatchNotification(
  payload: NotificationPayload,
  recipient: NotificationRecipient,
  channels: NotificationChannel[] = ALL_CHANNELS,
): Promise<void> {
  const channelNames = resolveChannelsForType(payload.type);
  const selected = channels.filter((c) => channelNames.includes(c.name));

  await Promise.all(
    selected.map(async (channel) => {
      try {
        await channel.send(payload, recipient);
      } catch (err) {
        console.error(`Notification channel "${channel.name}" failed`, err);
      }
    }),
  );
}
