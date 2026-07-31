import type { NotificationType } from "@/lib/notifications/types";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type { NotificationType };
