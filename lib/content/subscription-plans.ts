export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  featured?: boolean;
  features: string[];
  notIncluded: string[];
  /** Fatora charge amount in QAR (decimal). Undefined = not purchasable (free plan). */
  // TODO: confirm real QAR pricing with the business before launch.
  amountQar?: number;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start your journey",
    features: [
      "3 matches per day",
      "Basic profile",
      "Standard matching algorithm",
      "Chat with matches",
      "Profile verification",
    ],
    notIncluded: ["Advanced filters", "See who liked you", "Priority support", "AI coach access"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29",
    period: "month",
    description: "Most popular choice",
    featured: true,
    features: [
      "Unlimited matches",
      "Advanced profile options",
      "Enhanced matching algorithm",
      "See who liked you",
      "Advanced filters",
      "Priority chat placement",
      "Profile boost (2x/month)",
      "Read receipts",
      "AI coach access",
      "Priority support",
    ],
    notIncluded: [],
    amountQar: 100,
  },
  {
    id: "gold",
    name: "Gold",
    price: "$49",
    period: "month",
    description: "Complete experience",
    features: [
      "Everything in Premium",
      "Dedicated relationship counselor",
      "Family introduction mediation",
      "Background verification service",
      "Unlimited profile boosts",
      "VIP badge",
      "Early access to features",
      "Monthly compatibility reports",
    ],
    notIncluded: [],
    amountQar: 180,
  },
];
