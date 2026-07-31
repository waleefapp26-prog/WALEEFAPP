import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileById } from "./profiles";
import type { Report } from "@/lib/types/report";

type Row = { id: string; reporter_id: string; reported_id: string; reason: string; created_at: string };

export async function getAllReports(supabase: SupabaseClient): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("id, reporter_id, reported_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  const rows = (data as Row[] | null) ?? [];
  return Promise.all(
    rows.map(async (row) => {
      const [reporter, reported] = await Promise.all([
        getProfileById(supabase, row.reporter_id),
        getProfileById(supabase, row.reported_id),
      ]);
      return {
        id: row.id,
        reporterId: row.reporter_id,
        reporterName: reporter?.fullName ?? null,
        reportedId: row.reported_id,
        reportedName: reported?.fullName ?? null,
        reason: row.reason,
        createdAt: row.created_at,
      };
    }),
  );
}
