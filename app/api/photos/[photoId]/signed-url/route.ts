import { NextResponse } from "next/server";
import { canViewPhoto, type PhotoVisibilityRow } from "@/lib/photos/visibility";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

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

  const row = photo as PhotoVisibilityRow;
  if (!(await canViewPhoto(service, row, user.id))) {
    return NextResponse.json({ error: "Not authorized to view this photo" }, { status: 403 });
  }

  const { data: signed, error } = await service.storage.from("profile-photos").createSignedUrl(row.storage_path, 60);
  if (error || !signed) {
    return NextResponse.json({ error: "Failed to generate URL" }, { status: 502 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
