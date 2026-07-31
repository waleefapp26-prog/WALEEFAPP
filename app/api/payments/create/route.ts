import { NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from "@/lib/content/subscription-plans";
import { getStripeClient, isStripeConfigured } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { planId } = await request.json();
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan || !plan.amountQar) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      // QAR is a 2-decimal currency, so Stripe expects the amount in dirhams
      // (1/100 QAR). plan.amountQar is a decimal QAR figure.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "qar",
            unit_amount: Math.round(plan.amountQar * 100),
            product_data: {
              name: `Waleef ${plan.name}`,
              description: plan.description,
            },
          },
        },
      ],
      // Unlike the previous gateway, Stripe carries real metadata, so there's
      // no need to encode the user/plan into an order-id string. The webhook
      // reads these back directly.
      metadata: { user_id: user.id, plan_id: plan.id },
      success_url: `${siteUrl}/dashboard/premium?status=success`,
      cancel_url: `${siteUrl}/dashboard/premium?status=cancelled`,
    });

    if (!session.url) {
      console.error("Stripe session created without a checkout url", session.id);
      return NextResponse.json({ error: "Failed to start payment" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout creation failed", err);
    return NextResponse.json({ error: "Failed to start payment" }, { status: 502 });
  }
}
