import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase/service";

type ResendEvent = {
  type: string;
  data?: {
    email_id?: string;
    to?: string[] | string;
  };
};

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  let event: ResendEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendEvent;
  } catch (err) {
    console.error("Invalid Resend webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const recipient = Array.isArray(event.data?.to) ? event.data.to[0] : event.data?.to;

  const service = createServiceClient();
  const { error } = await service.from("email_events").insert({
    resend_email_id: event.data?.email_id ?? null,
    event_type: event.type,
    recipient: recipient ?? null,
    payload: event,
  });
  if (error) {
    console.error("Failed to log email event", error);
  }

  return NextResponse.json({ received: true });
}
