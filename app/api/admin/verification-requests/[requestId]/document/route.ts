import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const service = createServiceClient();
  const { data: reqRow } = await service
    .from("verification_requests")
    .select("document_storage_path")
    .eq("id", requestId)
    .maybeSingle();
  if (!reqRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signed, error } = await service.storage
    .from("verification-documents")
    .createSignedUrl(reqRow.document_storage_path, 60);
  if (error || !signed) {
    return NextResponse.json({ error: "Failed to generate URL" }, { status: 502 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}
