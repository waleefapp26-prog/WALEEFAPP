import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type PhotoRow = {
  user_id: string;
  storage_path: string;
  visibility: "public" | "matched" | "approved" | "hidden";
  moderation_status: "pending" | "approved" | "rejected";
};

export async function GET(request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await params;
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
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const row = photo as PhotoRow;
  const isOwner = row.user_id === user.id;

  if (!isOwner) {
    if (row.moderation_status !== "approved") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let allowed = false;
    if (row.visibility === "public") {
      allowed = true;
    } else if (row.visibility === "matched") {
      const [lo, hi] = [user.id, row.user_id].sort();
      const { data: match } = await service
        .from("matches")
        .select("id")
        .eq("user_a", lo)
        .eq("user_b", hi)
        .maybeSingle();
      allowed = !!match;
    } else if (row.visibility === "approved") {
      const { data: accessRequest } = await service
        .from("photo_access_requests")
        .select("status")
        .eq("viewer_id", user.id)
        .eq("owner_id", row.user_id)
        .maybeSingle();
      allowed = accessRequest?.status === "approved";
    }
    // visibility === "hidden": allowed stays false, no non-owner can ever see it.

    if (!allowed) {
      return NextResponse.json({ error: "Not authorized to view this photo" }, { status: 403 });
    }
  }

  const { data: signed, error } = await service.storage.from("profile-photos").createSignedUrl(row.storage_path, 60);
  if (error || !signed) {
    return NextResponse.json({ error: "Failed to generate URL" }, { status: 502 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
