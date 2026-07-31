export type SubscriptionPlan = {
  id: string;
  name: string;
  nameAr: string;
  /** Legacy display string. Marketing surfaces should derive price from
   * `amountQar` instead -- this said "$29" while Stripe charged 100 QAR. */
  price: string;
  period: string;
  description: string;
  descriptionAr: string;
  featured?: boolean;
  features: string[];
  notIncluded: string[];
  /** Stripe charge amount in QAR (decimal). Undefined = not purchasable (free plan). */
  // TODO: confirm real QAR pricing with the business before launch.
  amountQar?: number;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    nameAr: "مجاني",
    price: "$0",
    period: "forever",
    description: "Start your journey",
    descriptionAr: "ابدأ رحلتك",
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
    nameAr: "مميز",
    price: "$29",
    period: "month",
    description: "Most popular choice",
    descriptionAr: "الخيار الأكثر شيوعاً",
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
    nameAr: "ذهبي",
    price: "$49",
    period: "month",
    description: "Complete experience",
    descriptionAr: "التجربة الكاملة",
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
