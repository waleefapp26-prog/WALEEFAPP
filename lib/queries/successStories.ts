import type { SupabaseClient } from "@supabase/supabase-js";

export type SuccessStory = {
  id: string;
  coupleName: string;
  coupleNameAr: string | null;
  location: string | null;
  locationAr: string | null;
  storyEn: string;
  storyAr: string | null;
  consented: boolean;
  approved: boolean;
  createdAt: string;
};

type Row = {
  id: string;
  couple_name: string;
  couple_name_ar: string | null;
  location: string | null;
  location_ar: string | null;
  story_en: string;
  story_ar: string | null;
  consented: boolean;
  approved: boolean;
  created_at: string;
};

function mapRow(row: Row): SuccessStory {
  return {
    id: row.id,
    coupleName: row.couple_name,
    coupleNameAr: row.couple_name_ar,
    location: row.location,
    locationAr: row.location_ar,
    storyEn: row.story_en,
    storyAr: row.story_ar,
    consented: row.consented,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

const COLUMNS = "id, couple_name, couple_name_ar, location, location_ar, story_en, story_ar, consented, approved, created_at";

/** Stories cleared for publication. RLS already restricts anonymous readers to
 *  approved + consented rows; the filter is repeated here so an admin session
 *  (which can see everything) doesn't accidentally publish a draft. */
export async function getPublishedSuccessStories(supabase: SupabaseClient): Promise<SuccessStory[]> {
  const { data, error } = await supabase
    .from("success_stories")
    .select(COLUMNS)
    .eq("approved", true)
    .eq("consented", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(mapRow);
}

/** Everything, including drafts -- admin only, enforced by RLS. */
export async function getAllSuccessStories(supabase: SupabaseClient): Promise<SuccessStory[]> {
  const { data, error } = await supabase
    .from("success_stories")
    .select(COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(mapRow);
}
