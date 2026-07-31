import { NextResponse } from "next/server";
import { dispatchNotification } from "@/lib/notifications/dispatch";
import type { NotificationType } from "@/lib/notifications/types";
import { createServiceClient } from "@/lib/supabase/service";

type WebhookPayload = {
  record: {
    user_id: string;
    type: NotificationType;
    title: string;
    body: string | null;
    link: string | null;
  };
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.NOTIFICATIONS_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { record } = (await request.json()) as WebhookPayload;
  if (!record?.user_id) {
    return NextResponse.json({ error: "Missing record" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: userResult } = await service.auth.admin.getUserById(record.user_id);

  await dispatchNotification(
    { type: record.type, title: record.title, body: record.body, link: record.link },
    { userId: record.user_id, email: userResult?.user?.email ?? null },
  );

  return NextResponse.json({ received: true });
}
