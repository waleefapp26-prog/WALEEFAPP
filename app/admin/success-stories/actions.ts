"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StoryActionResult = { success: true } | { success: false; error: string };

export type NewStoryInput = {
  coupleName: string;
  coupleNameAr: string;
  location: string;
  locationAr: string;
  storyEn: string;
  storyAr: string;
  consented: boolean;
};

/** Authorization is the success_stories_*_admin RLS policies, not a check
 *  here -- a non-admin calling these actions directly affects zero rows. */
export async function createSuccessStory(input: NewStoryInput): Promise<StoryActionResult> {
  if (!input.coupleName.trim() || !input.storyEn.trim()) {
    return { success: false, error: "A couple name and the story text are both required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("success_stories")
    .insert({
      couple_name: input.coupleName.trim(),
      couple_name_ar: input.coupleNameAr.trim() || null,
      location: input.location.trim() || null,
      location_ar: input.locationAr.trim() || null,
      story_en: input.storyEn.trim(),
      story_ar: input.storyAr.trim() || null,
      consented: input.consented,
    })
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) return { success: false, error: "Not authorized to add success stories." };

  revalidatePath("/admin/success-stories");
  return { success: true };
}

export async function setStoryApproval(storyId: string, approved: boolean): Promise<StoryActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("success_stories")
    .update({ approved, approved_at: approved ? new Date().toISOString() : null })
    .eq("id", storyId)
    .select("id");

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) return { success: false, error: "Not authorized to publish success stories." };

  // The landing page and /success-stories both read this table.
  revalidatePath("/");
  revalidatePath("/success-stories");
  revalidatePath("/admin/success-stories");
  return { success: true };
}

export async function deleteSuccessStory(storyId: string): Promise<StoryActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("success_stories").delete().eq("id", storyId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/success-stories");
  revalidatePath("/admin/success-stories");
  return { success: true };
}
