import { NextResponse } from "next/server";
import { getResendClient, isResendConfigured } from "@/lib/email/resend";
import { createServiceClient } from "@/lib/supabase/service";

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  const waliEmail = email?.trim().toLowerCase();

  if (!waliEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const service = createServiceClient();

  const { count } = await service
    .from("wali_invites")
    .select("id", { count: "exact", head: true })
    .eq("wali_email", waliEmail);

  // Always return success even with no invites for this email, so the
  // endpoint can't be used to enumerate which emails have been invited.
  if (!count) {
    return NextResponse.json({ success: true });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await service.from("wali_login_codes").insert({ wali_email: waliEmail, code, expires_at: expiresAt });

  // A guardian who never receives the code has no other way in, so an
  // undelivered code has to be reported rather than swallowed -- otherwise the
  // screen just waits forever on a code that was never sent.
  if (!isResendConfigured()) {
    console.warn("RESEND_API_KEY is not set -- wali login code not sent");
    return NextResponse.json({ success: true, emailSent: false });
  }

  try {
    await getResendClient().emails.send({
      from: "Waleef <onboarding@resend.dev>",
      to: waliEmail,
      subject: "رمز الدخول إلى لوحة الوليّ في تطبيق وليف",
      html: `<p>رمز الدخول الخاص بك هو: <strong>${code}</strong></p><p>صالح لمدة 10 دقائق.</p>`,
    });
  } catch (err) {
    console.error("Failed to send wali login code email", err);
    return NextResponse.json({ success: true, emailSent: false });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
