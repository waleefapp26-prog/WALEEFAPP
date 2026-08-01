"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Lock, MessageCircle, Send, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { coachGreeting, coachSuggestions } from "@/lib/content/ai-coach";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import styles from "@/styles/features/ai-coach.module.css";

type Sender = "ai" | "user";

type Msg = {
  id: number;
  sender: Sender;
  text: string;
};

function nextId(msgs: Msg[]) {
  return msgs.reduce((m, x) => Math.max(m, x.id), 0) + 1;
}

const QUICK_TOPICS = [
  {
    labelKey: "communication" as const,
    icon: Heart,
    chipClass: "chipPink",
    prompt: "How can I communicate better with my match?",
  },
  {
    labelKey: "familyInvolvement" as const,
    icon: Users,
    chipClass: "chipOrange",
    prompt: "When and how should I involve my wali or family?",
  },
  {
    labelKey: "firstMeeting" as const,
    icon: MessageCircle,
    chipClass: "chipPurple",
    prompt: "What should I know before our first meeting?",
  },
] as const;

type Props = {
  /** Free-tier users get an upsell instead of a composer they cannot use. */
  isPremium?: boolean;
};

export function AICoachScreen({ isPremium = false }: Props) {
  const { dictionary, locale } = useTranslation();
  // Greeting only -- the old seed included a fabricated user turn.
  const [messages, setMessages] = useState<Msg[]>(() => [coachGreeting(locale)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (overrideText?: string) => {
    const t = (overrideText ?? input).trim();
    if (!t || loading) return;

    const updated = [...messages, { id: nextId(messages), sender: "user" as const, text: t }];
    setMessages(updated);
    setInput("");
    setError(undefined);
    setLoading(true);

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
          locale,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? dictionary.auth.genericError);
        return;
      }
      setMessages((prev) => [...prev, { id: nextId(prev), sender: "ai", text: data.reply }]);
    } catch {
      setError(dictionary.auth.genericError);
    } finally {
      setLoading(false);
    }
  };

  const showSuggestions = isPremium && messages.filter((m) => m.sender === "user").length === 0;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroRow}>
            <div className={styles.heroIcon}>
              <Sparkles size={24} aria-hidden />
            </div>
            <div>
              <h1 className={styles.heroTitle}>{dictionary.coach.title}</h1>
              <p className={styles.heroSub}>{dictionary.coach.sub}</p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.topics}>
        <div className={styles.topicsInner}>
          <p className={styles.topicsLabel}>{dictionary.coach.quickTopics}</p>
          <div className={styles.chipRow}>
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.labelKey}
                type="button"
                className={`${styles.chip} ${styles[topic.chipClass]}`}
                onClick={() => void send(topic.prompt)}
                disabled={loading}
              >
                <topic.icon size={14} aria-hidden />
                {dictionary.coach[topic.labelKey]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.messages}>
        <div className={styles.messagesInner}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.msgRow} ${msg.sender === "user" ? styles.msgEnd : styles.msgStart}`}
            >
              {msg.sender === "ai" ? (
                <div className={styles.aiAvatar}>
                  <Sparkles size={18} aria-hidden />
                </div>
              ) : null}
              <div className={`${styles.bubble} ${msg.sender === "user" ? styles.bubbleUser : styles.bubbleAi}`}>
                <p className={styles.bubbleText}>{msg.text}</p>
              </div>
            </div>
          ))}
          {loading ? (
            <div className={`${styles.msgRow} ${styles.msgStart}`}>
              <div className={styles.aiAvatar}>
                <Sparkles size={18} aria-hidden />
              </div>
              <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                <p className={styles.bubbleText}>{dictionary.coach.thinking}</p>
              </div>
            </div>
          ) : null}
          {error ? <p style={{ color: "#d9364a", fontSize: "0.875rem", textAlign: "center" }}>{error}</p> : null}
          <div ref={bottomRef} />
        </div>
      </div>

      {showSuggestions ? (
        <div className={styles.suggestions}>
          <div className={styles.suggestionsInner}>
            <p className={styles.suggLabel}>{dictionary.coach.suggestedQuestions}</p>
            <div className={styles.suggGrid}>
              {coachSuggestions(locale).map((s) => (
                <Card key={s.label} onClick={() => void send(s.prompt)} className={styles.suggCard}>
                  {s.label}
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {isPremium ? (
        <div className={styles.footer}>
          <div className={styles.footerInner}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void send();
              }}
              placeholder={dictionary.coach.inputPlaceholder}
              className={styles.input}
              aria-label={dictionary.coach.inputPlaceholder}
              disabled={loading}
            />
            <button type="button" className={styles.send} onClick={() => void send()} aria-label="Send" disabled={loading}>
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* Stated up front rather than after the user types and gets a 403. */
        <div className={styles.locked}>
          <div className={styles.lockedInner}>
            <Lock size={22} className={styles.lockedIcon} aria-hidden />
            <div className={styles.lockedText}>
              <p className={styles.lockedTitle}>{dictionary.coach.lockedTitle}</p>
              <p className={styles.lockedBody}>{dictionary.coach.lockedBody}</p>
            </div>
            <Button href="/dashboard/premium">{dictionary.coach.lockedCta}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
