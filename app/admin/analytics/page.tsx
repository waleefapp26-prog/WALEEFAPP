import { AdminAnalyticsScreen } from "@/components/screens/admin/AdminAnalyticsScreen";
import { getAdminAnalytics } from "@/lib/queries/adminAnalytics";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const analytics = await getAdminAnalytics(supabase);

  return <AdminAnalyticsScreen analytics={analytics} />;
}
