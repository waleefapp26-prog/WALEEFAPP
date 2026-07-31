"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { ConversationPreview } from "@/lib/queries/conversations";
import styles from "@/styles/features/chat-list.module.css";

type Props = {
  conversations: ConversationPreview[];
};

export function ChatListScreen({ conversations }: Props) {
  const { dictionary } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>{dictionary.chatList.title}</h1>

        {conversations.length === 0 ? (
          <p className={styles.empty}>{dictionary.chatList.empty}</p>
        ) : (
          <div className={styles.list}>
            {conversations.map((conversation) => (
              <Link key={conversation.id} href={`/dashboard/chats/${conversation.id}`} className={styles.linkReset}>
                <Card className={styles.row}>
                  <span className={styles.avatar} aria-hidden>
                    {conversation.otherParticipant.fullName?.[0] ?? "?"}
                  </span>
                  <div className={styles.body}>
                    <p className={styles.name}>{conversation.otherParticipant.fullName ?? dictionary.chatList.yourMatch}</p>
                    <p className={styles.preview}>{conversation.lastMessage?.body ?? dictionary.chatList.sayAssalamu}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
