export const PROPOSAL_APPROACH_OPTIONS = [
  {
    id: "self" as const,
    title: "Manage Myself",
    description: "Handle the proposal process independently and involve family later",
  },
  {
    id: "wali" as const,
    title: "Direct to Wali",
    description: "Connect your wali directly with the other party's family",
  },
  {
    id: "mediator" as const,
    title: "Waleef Mediator",
    description: "Let our Islamic counselor facilitate the introduction",
  },
];

export type ProposalApproachId = (typeof PROPOSAL_APPROACH_OPTIONS)[number]["id"];
