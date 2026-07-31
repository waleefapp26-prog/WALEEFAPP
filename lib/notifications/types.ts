export type NotificationType =
  | "new_match"
  | "new_message"
  | "profile_like"
  | "wali_status_change"
  | "verification_status_change"
  | "payment_event"
  | "high_compatibility_match"
  | "profile_completion_reminder"
  | "optional_questions_requested";

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
};

export type NotificationRecipient = {
  userId: string;
  email: string | null;
};

export interface NotificationChannel {
  name: "in_app" | "email" | "push";
  send(payload: NotificationPayload, recipient: NotificationRecipient): Promise<void>;
}
