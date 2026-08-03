import { MarkSectionRead } from "@/components/dashboard/MarkSectionRead";
import { SubscriptionScreen } from "@/components/screens/SubscriptionScreen";

export default function DashboardPremiumPage() {
  return (
    <>
      <MarkSectionRead navKey="premium" />
      <SubscriptionScreen />
    </>
  );
}
