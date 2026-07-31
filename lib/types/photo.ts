export type PhotoVisibility = "public" | "matched" | "approved" | "hidden";
export type PhotoModerationStatus = "pending" | "approved" | "rejected";

export type ProfilePhoto = {
  id: string;
  userId: string;
  storagePath: string;
  isMain: boolean;
  visibility: PhotoVisibility;
  moderationStatus: PhotoModerationStatus;
  createdAt: string;
};
