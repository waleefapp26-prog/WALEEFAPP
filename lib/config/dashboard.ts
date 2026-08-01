import type { LucideIcon } from "lucide-react";
import { Crown, Heart, MessageCircle, Sparkles, User, Users } from "lucide-react";

export type DashboardNavItem = {
  href: string;
  labelKey: "matches" | "chats" | "aiCoach" | "family" | "premium" | "profile";
  icon: LucideIcon;
};

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard", labelKey: "matches", icon: Heart },
  { href: "/dashboard/chats", labelKey: "chats", icon: MessageCircle },
  { href: "/dashboard/coach", labelKey: "aiCoach", icon: Sparkles },
  { href: "/dashboard/family", labelKey: "family", icon: Users },
  { href: "/dashboard/premium", labelKey: "premium", icon: Crown },
  { href: "/dashboard/profile", labelKey: "profile", icon: User },
];
