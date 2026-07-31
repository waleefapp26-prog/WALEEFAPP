import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types/profile";

type ProfileRow = {
  id: string;
  full_name: string | null;
  pseudonym: string | null;
  photo_verified: boolean;
  age: number | null;
  gender: "male" | "female" | null;
  phone: string | null;
  location: string | null;
  prayer_frequency: string[] | null;
  hijab_preference: string | null;
  education: string | null;
  occupation: string | null;
  bio: string | null;
  interests: string[] | null;
  looking_for: string | null;
  avatar_url: string | null;
  verified: boolean;
  premium: boolean;
  onboarding_complete: boolean;
  subscription_tier: "free" | "premium" | "gold";
  subscription_expires_at: string | null;
  is_admin: boolean;
  incognito: boolean;
  chat_retention_days: number | null;
  created_at: string;
};

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    pseudonym: row.pseudonym,
    photoVerified: row.photo_verified,
    age: row.age,
    gender: row.gender,
    phone: row.phone,
    location: row.location,
    prayerFrequency: row.prayer_frequency ?? [],
    hijabPreference: row.hijab_preference,
    education: row.education,
    occupation: row.occupation,
    bio: row.bio,
    interests: row.interests ?? [],
    lookingFor: row.looking_for,
    avatarUrl: row.avatar_url,
    verified: row.verified,
    premium: row.premium,
    onboardingComplete: row.onboarding_complete,
    subscriptionTier: row.subscription_tier,
    subscriptionExpiresAt: row.subscription_expires_at,
    isAdmin: row.is_admin,
    incognito: row.incognito,
    chatRetentionDays: row.chat_retention_days,
    createdAt: row.created_at,
  };
}

export type CandidateFilters = {
  ageMin?: number;
  ageMax?: number;
  location?: string;
  education?: string;
  interests?: string[];
};

export async function getCandidateProfiles(
  supabase: SupabaseClient,
  limit = 20,
  filters: CandidateFilters = {},
): Promise<Profile[]> {
  const { data, error } = await supabase.rpc("get_candidate_profiles", {
    p_limit: limit,
    p_age_min: filters.ageMin ?? null,
    p_age_max: filters.ageMax ?? null,
    p_location: filters.location ?? null,
    p_education: filters.education ?? null,
    p_interests: filters.interests ?? null,
  });
  if (error) throw error;
  return ((data as ProfileRow[] | null) ?? []).map(mapProfileRow);
}

export async function getProfileById(supabase: SupabaseClient, id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapProfileRow(data as ProfileRow) : null;
}

export async function getAllProfilesForAdmin(supabase: SupabaseClient): Promise<Profile[]> {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return ((data as ProfileRow[] | null) ?? []).map(mapProfileRow);
}
