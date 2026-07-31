import { NextResponse } from "next/server";
import { activeCoachProvider } from "@/lib/ai-coach";
import { createClient } from "@/lib/supabase/server";

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_tier === "free") {
    return NextResponse.json(
      { error: "AI Coach is a premium feature. Upgrade your plan to unlock it." },
      { status: 403 },
    );
  }

  const { messages } = (await request.json()) as { messages: IncomingMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const reply = await activeCoachProvider.reply(messages);

  // Small delay so the "Thinking..." state in the UI feels natural.
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json({ reply });
}
