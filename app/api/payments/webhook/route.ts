import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, isStripeConfigured } from "@/lib/payments/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // The raw body is required for signature verification -- parsing it as JSON
  // first would change the bytes and invalidate the signature.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await getStripeClient().webhooks.constructEventAsync(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // A bad signature means this POST didn't come from Stripe, so a spoofed
    // request can't fake a payment.
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge everything else so Stripe stops retrying it.
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan_id;

  if (!userId || !plan) {
    console.error("Stripe session missing metadata", session.id);
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Upserting on the session id keeps this idempotent -- Stripe retries
  // deliveries, and a repeat of the same event must not double-apply.
  await supabase.from("payments").upsert(
    {
      gateway_payment_id: session.id,
      user_id: userId,
      plan,
      amount: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "qar").toUpperCase(),
      status: session.payment_status,
    },
    { onConflict: "gateway_payment_id" },
  );

  if (session.payment_status === "paid") {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    await supabase
      .from("profiles")
      .update({ subscription_tier: plan, subscription_expires_at: expiresAt.toISOString() })
      .eq("id", userId);
  }

  return NextResponse.json({ received: true });
}
