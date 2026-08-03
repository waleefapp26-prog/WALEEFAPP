"use server";

import { EMAIL_FROM, getResendClient, isResendConfigured } from "@/lib/email/resend";
import { createClient } from "@/lib/supabase/server";

export type SubmitProposalInput = {
  matchId: string;
  approach: string;
  waliName: string;
  waliRelation: string;
  waliPhone: string;
  waliEmail: string;
};

export type SubmitProposalResult =
  /** `emailSent: false` means the invite was saved but the guardian was NOT
   *  contacted -- the caller must show `waliUrl` so the member can pass the
   *  link on themselves. This used to be reported as a plain success, so the
   *  screen promised an email that had never been sent. */
  | { success: true; emailSent: boolean; waliUrl?: string }
  | { success: false; error: string };

export async function submitProposal(input: SubmitProposalInput): Promise<SubmitProposalResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Your session expired. Please log in again." };
  }

  // "self" means the requester will make the approach themselves -- there is
  // no wali to invite or email, so skip creating a wali_invites row entirely.
  if (input.approach === "self") {
    return { success: true, emailSent: false };
  }

  if (!input.waliName.trim() || !input.waliRelation || !input.waliEmail.trim()) {
    return { success: false, error: "Please fill in your guardian's name, relation, and email." };
  }

  const { data, error } = await supabase
    .from("wali_invites")
    .insert({
      requester_id: user.id,
      match_id: input.matchId,
      wali_name: input.waliName.trim(),
      wali_relation: input.waliRelation,
      wali_phone: input.waliPhone.trim() || null,
      wali_email: input.waliEmail.trim(),
      notes: input.approach,
    })
    .select("token")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Failed to submit your request. Please try again." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const waliUrl = `${siteUrl}/wali/${data.token}`;

  if (!isResendConfigured()) {
    // No mail provider at all. The invite is real and the link works; say so
    // plainly rather than claiming the guardian was emailed.
    console.warn("RESEND_API_KEY is not set -- wali invite email not sent");
    return { success: true, emailSent: false, waliUrl };
  }

  try {
    await getResendClient().emails.send({
      from: EMAIL_FROM,
      to: input.waliEmail.trim(),
      subject: "وصلكم طلب نظرة شرعية عبر تطبيق وليف",
      html: `
        <p>السلام عليكم ${input.waliName.trim()},</p>
        <p>وصلكم طلب نظرة شرعية لأحد أفراد أسرتكم عبر تطبيق وليف، وهو تطبيق تعارف جاد بهدف الزواج يراعي الخصوصية والقيم الأسرية.</p>
        <p>يرجى الاطلاع على التفاصيل والرد من خلال الرابط التالي:</p>
        <p><a href="${waliUrl}">${waliUrl}</a></p>
      `,
    });
  } catch (err) {
    // The invite row exists either way, so this isn't a failure of the whole
    // action -- but the member still needs to know nobody was contacted.
    console.error("Failed to send wali invite email", err);
    return { success: true, emailSent: false, waliUrl };
  }

  return { success: true, emailSent: true };
}
