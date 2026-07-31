export type PhotoAccessRequestStatus = "pending" | "approved" | "declined";

export type PhotoAccessRequest = {
  id: string;
  viewerId: string;
  ownerId: string;
  status: PhotoAccessRequestStatus;
  createdAt: string;
  respondedAt: string | null;
};
