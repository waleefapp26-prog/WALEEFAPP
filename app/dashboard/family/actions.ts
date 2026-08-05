"use server";

import { createClient } from "@/lib/supabase/server";
import type { WaliChatPermission } from "@/lib/types/wali";

export type SetWaliChatPermissionResult = { success: true; permission: WaliChatPermission } | { success: false; error: string };

export async function setWaliChatPermission(
  waliInviteId: string,
  permission: WaliChatPermission,
): Promise<SetWaliChatPermissionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Your session expired. Please log in again." };

  const { data, error } = await supabase.rpc("set_wali_chat_permission", {
    p_wali_invite_id: waliInviteId,
    p_permission: permission,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, permission: data as WaliChatPermission };
}
