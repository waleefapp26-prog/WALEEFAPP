import { AdminReportsScreen } from "@/components/screens/admin/AdminReportsScreen";
import { getAllReports } from "@/lib/queries/reports";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const reports = await getAllReports(supabase);

  return <AdminReportsScreen reports={reports} />;
}
