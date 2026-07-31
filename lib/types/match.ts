export type SwipeAction = "like" | "pass";

export type Match = {
  id: string;
  userA: string;
  userB: string;
  status: "active" | "frozen";
  createdAt: string;
};

export type Conversation = {
  id: string;
  matchId: string;
  createdAt: string;
};
