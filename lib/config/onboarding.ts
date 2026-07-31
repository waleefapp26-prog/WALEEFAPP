import type { LucideIcon } from "lucide-react";
import { Heart, Shield, Users } from "lucide-react";

export type OnboardingSlideVariant = "partner" | "privacy" | "family";

export type OnboardingSlide = {
  icon: LucideIcon;
  title: string;
  description: string;
  variant: OnboardingSlideVariant;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    icon: Heart,
    title: "Find Your Life Partner",
    description:
      "Waleef helps you connect with compatible matches who share your values and vision for a halal marriage.",
    variant: "partner",
  },
  {
    icon: Shield,
    title: "Privacy & Respect",
    description:
      "Your journey is private and protected. We prioritize your safety and dignity every step of the way.",
    variant: "privacy",
  },
  {
    icon: Users,
    title: "Family Involvement",
    description: "Involve your wali or guardian at your pace. We support traditional values in a modern way.",
    variant: "family",
  },
];
