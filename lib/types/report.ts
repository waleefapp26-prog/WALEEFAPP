export type Report = {
  id: string;
  reporterId: string;
  reporterName: string | null;
  reportedId: string;
  reportedName: string | null;
  reason: string;
  createdAt: string;
};
