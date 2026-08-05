"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { WaliChatPermission } from "@/lib/types/wali";
import styles from "@/styles/features/chat.module.css";
import wrapStyles from "@/styles/features/wali-review.module.css";

export type WaliChatMessage = {
  id: string;
  senderId: string | null;
  senderName: string | null;
  isWali: boolean;
  body: string;
  createdAt: string;
};

export type WaliOwnReaction = { messageId: string; emoji: string };

const REACTION_EMOJI = ["❤️", "👍", "🤲"] as const;

type Props = {
  token: string;
  permission: WaliChatPermission;
  waliName: string;
  initialMessages: WaliChatMessage[];
  initialReactions: WaliOwnReaction[];
};

export function WaliChatViewScreen({ token, permission, waliName, initialMessages, initialReactions }: Props) {
  const { dictionary } = useTranslation();
  const supabase = createClient();
  const [messages, setMessages] = useState(initialMessages);
  const [ownReactions, setOwnReactions] = useState<Record<string, string>>(
    Object.fromEntries(initialReactions.map((r) => [r.messageId, r.emoji])),
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();

  const canReact = permission === "react" || permission === "chat";
  const canChat = permission === "chat";

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError(undefined);
    try {
      const { data, error: rpcError } = await supabase.rpc("send_message_as_wali", { p_token: token, p_body: body });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      setText("");
      setMessages((prev) => [
        ...prev,
        {
          id: (data as string) ?? `local-${Date.now()}`,
          senderId: null,
          senderName: waliName,
          isWali: true,
          body,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setError(dictionary.auth.genericError);
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    const previous = ownReactions[messageId];
    // Optimistic: toggle off if the same emoji is tapped again, else replace.
    setOwnReactions((prev) => {
      const next = { ...prev };
      if (previous === emoji) delete next[messageId];
      else next[messageId] = emoji;
      return next;
    });
    const { error: rpcError } = await supabase.rpc("react_to_message_as_wali", {
      p_token: token,
      p_message_id: messageId,
      p_emoji: emoji,
    });
    if (rpcError) {
      // Roll back on failure.
      setOwnReactions((prev) => {
        const next = { ...prev };
        if (previous) next[messageId] = previous;
        else delete next[messageId];
        return next;
      });
    }
  };

  return (
    <div className={wrapStyles.page}>
      <div className={wrapStyles.inner}>
        <h1 className={wrapStyles.heading}>{dictionary.waliChat.heading}</h1>
        <p className={wrapStyles.body}>
          {canChat ? dictionary.waliChat.chatNote : canReact ? dictionary.waliChat.reactNote : dictionary.waliChat.readOnlyNote}
        </p>

        <div className={styles.messages}>
          <div className={styles.messagesInner}>
            {messages.length === 0 ? (
              <p>{dictionary.waliChat.empty}</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`${styles.row} ${msg.isWali ? styles.rowEnd : styles.rowStart}`}>
                  <div>
                    <div className={`${styles.bubble} ${msg.isWali ? styles.bubbleWali : styles.bubbleThem}`}>
                      {!msg.isWali ? (
                        <p className={styles.waliSenderLabel}>
                          {msg.senderName ?? dictionary.waliChat.participantFallback}
                        </p>
                      ) : null}
                      <p className={styles.bubbleText}>{msg.body}</p>
                      <p className={styles.time}>{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                    {canReact ? (
                      <div className={`${styles.reactionRow} ${msg.isWali ? styles.rowEnd : styles.rowStart}`}>
                        {REACTION_EMOJI.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={styles.reactionChip}
                            style={ownReactions[msg.id] === emoji ? { borderColor: "var(--waleef-gold)" } : undefined}
                            aria-label={`${dictionary.waliChat.reactAria} ${emoji}`}
                            onClick={() => void handleReact(msg.id, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {canChat ? (
          <div className={styles.footer}>
            <div className={styles.footerInner}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSend();
                }}
                placeholder={dictionary.waliChat.typeMessage}
                className={styles.input}
                aria-label={dictionary.waliChat.typeMessage}
                disabled={sending}
              />
              <button
                type="button"
                className={styles.send}
                onClick={() => void handleSend()}
                disabled={sending}
                aria-label={dictionary.waliChat.send}
              >
                <Send size={20} />
              </button>
            </div>
            {error ? <p className={styles.actionError}>{error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
