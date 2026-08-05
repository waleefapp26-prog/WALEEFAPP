"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Send, Shield, Star, Users } from "lucide-react";
import { setMatchStatus, submitMatchRating, toggleChatInvolvement } from "@/app/dashboard/chat/actions";
import { Button, MemberAvatar, Modal, Textarea } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/queries/conversations";
import styles from "@/styles/features/chat.module.css";

type Msg = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function toMsg(row: ChatMessage): Msg {
  return { id: row.id, senderId: row.senderId, text: row.body, timestamp: formatTimestamp(row.createdAt) };
}

type Props = {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  otherParticipantName: string;
  initialMessages: ChatMessage[];
  initialWaliInvolved: boolean;
  matchId: string;
  initialMatchStatus: "active" | "frozen";
};

export function ChatScreen({
  conversationId,
  currentUserId,
  otherUserId,
  otherParticipantName,
  initialMessages,
  initialWaliInvolved,
  matchId,
  initialMatchStatus,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [messages, setMessages] = useState<Msg[]>(() => initialMessages.map(toMsg));
  const [text, setText] = useState("");
  const [waliInvolved, setWaliInvolved] = useState(initialWaliInvolved);
  const [waliError, setWaliError] = useState<string>();
  const [matchStatus, setMatchStatusState] = useState(initialMatchStatus);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [safetyPending, setSafetyPending] = useState(false);
  const [safetyError, setSafetyError] = useState<string>();
  const [statusPending, setStatusPending] = useState(false);
  const [statusError, setStatusError] = useState<string>();
  const [ratingError, setRatingError] = useState<string>();
  // Block and delete are irreversible, so each gets its own confirm step
  // rather than firing straight off the options list.
  const [confirm, setConfirm] = useState<"block" | "delete" | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; sender_id: string; body: string; created_at: string };
          if (row.sender_id === currentUserId) return; // already shown via optimistic append
          setMessages((prev) => [
            ...prev,
            { id: row.id, senderId: row.sender_id, text: row.body, timestamp: formatTimestamp(row.created_at) },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, currentUserId]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        senderId: currentUserId,
        text: t,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      },
    ]);

    try {
      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: currentUserId, body: t });
      if (error) console.error("Failed to send message", error);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleBlock = async () => {
    setSafetyPending(true);
    setSafetyError(undefined);
    try {
      const { error } = await supabase
        .from("blocks")
        .insert({ blocker_id: currentUserId, blocked_id: otherUserId });
      if (error) {
        setSafetyError(error.message);
        return;
      }
      router.push("/dashboard/chats");
    } catch {
      setSafetyError(dictionary.auth.genericError);
    } finally {
      setSafetyPending(false);
    }
  };

  const handleDeleteConversation = async () => {
    setSafetyPending(true);
    setSafetyError(undefined);
    try {
      const { error } = await supabase.rpc("delete_conversation", { p_conversation_id: conversationId });
      if (error) {
        setSafetyError(error.message);
        return;
      }
      router.push("/dashboard/chats");
    } catch {
      setSafetyError(dictionary.auth.genericError);
    } finally {
      setSafetyPending(false);
    }
  };

  const handleToggleStatus = async () => {
    const next = matchStatus === "active" ? "frozen" : "active";
    setStatusPending(true);
    setStatusError(undefined);
    const result = await setMatchStatus(matchId, next);
    setStatusPending(false);
    if (result.success) {
      setMatchStatusState(next);
      setMenuOpen(false);
    } else {
      setStatusError(result.error);
    }
  };

  const handleReport = async () => {
    const reason = reportReason.trim();
    if (!reason) return;
    setSafetyPending(true);
    setSafetyError(undefined);
    try {
      const { error } = await supabase
        .from("reports")
        .insert({ reporter_id: currentUserId, reported_id: otherUserId, reason });
      if (error) {
        setSafetyError(error.message);
        return;
      }
      setReportReason("");
      setReportSent(true);
    } catch {
      setSafetyError(dictionary.auth.genericError);
    } finally {
      setSafetyPending(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href={`/dashboard/profile/${otherUserId}`} className={styles.peer}>
            <MemberAvatar
              userId={otherUserId}
              fallback={otherParticipantName}
              className={styles.avatar}
              imgClassName={styles.avatarImg}
            />
            <div>
              <h3 className={styles.peerName}>{otherParticipantName}</h3>
              <div className={styles.statusRow}>
                <span className={styles.dot} />
                <span className={styles.statusText}>{dictionary.chatScreen.online}</span>
              </div>
            </div>
          </Link>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label={dictionary.chatScreen.options}
            onClick={() => setMenuOpen(true)}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Freezing had no visible effect outside the options list, so a frozen
          match looked identical to an active one. */}
      {matchStatus === "frozen" ? (
        <p className={styles.statusNotice}>{dictionary.chatScreen.frozenNotice}</p>
      ) : null}

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={dictionary.chatScreen.options}>
        <Button
          type="button"
          variant="outline"
          wide
          onClick={() => {
            setMenuOpen(false);
            setSafetyError(undefined);
            setReportSent(false);
            setReportOpen(true);
          }}
        >
          {dictionary.chatScreen.reportUser}
        </Button>
        <div style={{ height: "0.75rem" }} />
        <Button
          type="button"
          variant="secondary"
          wide
          disabled={statusPending}
          onClick={() => void handleToggleStatus()}
        >
          {statusPending
            ? dictionary.chatScreen.updating
            : matchStatus === "active"
              ? dictionary.chatScreen.freezeMatch
              : dictionary.chatScreen.reactivateMatch}
        </Button>
        {statusError ? <p className={styles.actionError}>{statusError}</p> : null}
        <div style={{ height: "0.75rem" }} />
        <Button
          type="button"
          variant="secondary"
          wide
          onClick={() => {
            setMenuOpen(false);
            setRatingError(undefined);
            setRatingOpen(true);
          }}
        >
          {dictionary.chatScreen.rateMatch}
        </Button>
        <div style={{ height: "0.75rem" }} />
        <Button
          type="button"
          variant="secondary"
          wide
          onClick={() => {
            setMenuOpen(false);
            setSafetyError(undefined);
            setConfirm("block");
          }}
        >
          {dictionary.chatScreen.blockUser}
        </Button>
        <div style={{ height: "0.75rem" }} />
        <Button
          type="button"
          variant="secondary"
          wide
          onClick={() => {
            setMenuOpen(false);
            setSafetyError(undefined);
            setConfirm("delete");
          }}
        >
          {dictionary.chatScreen.deleteConversation}
        </Button>
      </Modal>

      {/* Confirm step for the two irreversible actions. */}
      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={
          confirm === "delete" ? dictionary.chatScreen.deleteConfirmTitle : dictionary.chatScreen.blockConfirmTitle
        }
      >
        <p className={styles.confirmBody}>
          {confirm === "delete" ? dictionary.chatScreen.deleteConfirmBody : dictionary.chatScreen.blockConfirmBody}
        </p>
        {safetyError ? <p className={styles.actionError}>{safetyError}</p> : null}
        <div className={styles.confirmActions}>
          <Button type="button" variant="outline" wide disabled={safetyPending} onClick={() => setConfirm(null)}>
            {dictionary.common.cancel}
          </Button>
          <Button
            type="button"
            wide
            disabled={safetyPending}
            onClick={() => void (confirm === "delete" ? handleDeleteConversation() : handleBlock())}
          >
            {safetyPending
              ? confirm === "delete"
                ? dictionary.chatScreen.deleting
                : dictionary.chatScreen.blocking
              : confirm === "delete"
                ? dictionary.chatScreen.confirmDelete
                : dictionary.chatScreen.blockUser}
          </Button>
        </div>
      </Modal>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={dictionary.chatScreen.reportTitle}>
        {reportSent ? (
          <p>{dictionary.chatScreen.reportSent}</p>
        ) : (
          <>
            <Textarea
              placeholder={dictionary.chatScreen.whatHappened}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            {safetyError ? <p className={styles.actionError}>{safetyError}</p> : null}
            <div style={{ marginTop: "0.75rem" }}>
              <Button
                type="button"
                wide
                disabled={safetyPending || !reportReason.trim()}
                onClick={() => void handleReport()}
              >
                {safetyPending ? dictionary.chatScreen.submitting : dictionary.chatScreen.submitReport}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={ratingOpen} onClose={() => setRatingOpen(false)} title={dictionary.chatScreen.rateMatch}>
        {ratingSubmitted ? (
          <p>{dictionary.chatScreen.thanksFeedback}</p>
        ) : (
          <>
            <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.75rem" }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  onClick={() => setRating(value)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <Star
                    size={28}
                    color="var(--waleef-gold)"
                    fill={value <= rating ? "var(--waleef-gold)" : "none"}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder={dictionary.chatScreen.feedbackPlaceholder}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
            />
            <div style={{ marginTop: "0.75rem" }}>
              <Button
                type="button"
                wide
                disabled={rating === 0}
                onClick={async () => {
                  setRatingError(undefined);
                  const result = await submitMatchRating(matchId, rating, ratingFeedback);
                  if (result.success) setRatingSubmitted(true);
                  else setRatingError(result.error);
                }}
              >
                {dictionary.chatScreen.submitRating}
              </Button>
              {ratingError ? <p className={styles.actionError}>{ratingError}</p> : null}
            </div>
          </>
        )}
      </Modal>

      {!waliInvolved ? (
        <div className={styles.banner}>
          <div className={styles.bannerInner}>
            <Shield className={styles.bannerShield} size={20} aria-hidden />
            <div style={{ flex: 1 }}>
              <p className={styles.bannerTitle}>{dictionary.chatScreen.respectfulTitle}</p>
              <p className={styles.bannerDesc}>
                {waliError === "no_wali_invite" ? dictionary.chatScreen.noWaliInvite : dictionary.chatScreen.respectfulDesc}
              </p>
            </div>
            <Button
              variant="outline"
              className={styles.bannerBtn}
              size="md"
              onClick={async () => {
                const result = await toggleChatInvolvement(conversationId, true);
                if (result.success) {
                  setWaliInvolved(result.involved);
                } else {
                  setWaliError(result.error);
                }
              }}
            >
              {dictionary.chatScreen.involveWali}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.bannerGreen}>
          <div className={styles.bannerGreenInner}>
            <Users className={styles.bannerGreenIcon} size={20} aria-hidden />
            <p className={styles.bannerGreenText}>{dictionary.chatScreen.waliCanReview}</p>
          </div>
        </div>
      )}

      <div className={styles.messages}>
        <div className={styles.messagesInner}>
          {messages.map((msg) => {
            const mine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`${styles.row} ${mine ? styles.rowEnd : styles.rowStart}`}>
                <div className={`${styles.bubble} ${mine ? styles.bubbleMe : styles.bubbleThem}`}>
                  <p className={styles.bubbleText}>{msg.text}</p>
                  <p className={`${styles.time} ${mine ? styles.timeMe : styles.timeThem}`}>{msg.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInner}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            placeholder={dictionary.chatScreen.typeMessage}
            className={styles.input}
            aria-label={dictionary.chatScreen.typeMessage}
          />
          <button type="button" className={styles.send} onClick={() => void send()} aria-label="Send">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
