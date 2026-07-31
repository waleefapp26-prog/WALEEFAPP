import { AdminVerificationsScreen } from "@/components/screens/admin/AdminVerificationsScreen";
import { getPendingVerificationRequests } from "@/lib/queries/verification";
import { createClient } from "@/lib/supabase/server";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const requests = await getPendingVerificationRequests(supabase);

  return <AdminVerificationsScreen requests={requests} />;
}
