"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    try {
      await supabase.auth.signOut();
      // refresh() so the server re-reads the now-cleared session cookie and
      // middleware sends the visitor to /login rather than serving a cached
      // authenticated shell.
      router.push("/");
      router.refresh();
    } catch {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={cn(className)}
      onClick={() => void signOut()}
      disabled={pending}
      aria-label={dictionary.common.signOut}
    >
      <LogOut size={20} aria-hidden />
      <span>{dictionary.common.signOut}</span>
    </button>
  );
}
