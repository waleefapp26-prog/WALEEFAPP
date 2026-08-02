import { NextResponse } from "next/server";
import { canViewPhoto, type PhotoVisibilityRow } from "@/lib/photos/visibility";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/** A member's main photo, resolved and signed in one round trip.
 *
 *  Every avatar surface (match deck, profile view, chat list, chat header)
 *  previously rendered a letter, because nothing outside the owner's own
 *  photo manager ever looked up another member's photo. Resolving the photo id
 *  here rather than threading it through each server page keeps that lookup in
 *  one place. */
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: photo } = await service
    .from("profile_photos")
    .select("user_id, storage_path, visibility, moderation_status")
    .eq("user_id", userId)
    .eq("is_main", true)
    .maybeSingle();

  // No photo, or one this viewer isn't entitled to, both mean "fall back to
  // the initial" -- the caller shouldn't be able to tell those apart.
  if (!photo) {
    return NextResponse.json({ url: null });
  }

  const row = photo as PhotoVisibilityRow;
  if (!(await canViewPhoto(service, row, user.id))) {
    return NextResponse.json({ url: null });
  }

  const { data: signed } = await service.storage.from("profile-photos").createSignedUrl(row.storage_path, 60);
  return NextResponse.json({ url: signed?.signedUrl ?? null });
}
