export type WaliInviteStatus = "pending" | "approved" | "declined";

/** Ordered tiers -- each includes everything below it. */
export type WaliChatPermission = "none" | "read" | "react" | "chat";

export type WaliInvite = {
  id: string;
  requesterId: string;
  matchId: string | null;
  waliName: string;
  waliRelation: string;
  waliPhone: string | null;
  waliEmail: string;
  status: WaliInviteStatus;
  notes: string | null;
  createdAt: string;
  respondedAt: string | null;
  chatPermission: WaliChatPermission;
};
