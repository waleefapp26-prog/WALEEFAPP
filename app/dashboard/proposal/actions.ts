"use server";

import { getResendClient } from "@/lib/email/resend";
import { createClient } from "@/lib/supabase/server";

export type SubmitProposalInput = {
  matchId: string;
  approach: string;
  waliName: string;
  waliRelation: string;
  waliPhone: string;
  waliEmail: string;
};

export type SubmitProposalResult = { success: true } | { success: false; error: string };

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
    return { success: true };
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

  try {
    await getResendClient().emails.send({
      from: "Waleef <onboarding@resend.dev>",
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
    // The invite row was created successfully even if the email failed to
    // send -- don't fail the whole action, just log it for now.
    console.error("Failed to send wali invite email", err);
  }

  return { success: true };
}
