import styles from "@/styles/features/chat.module.css";
import wrapStyles from "@/styles/features/wali-review.module.css";

export type WaliChatMessage = {
  id: string;
  senderId: string;
  senderName: string | null;
  body: string;
  createdAt: string;
};

export function WaliChatViewScreen({ messages }: { messages: WaliChatMessage[] }) {
  return (
    <div className={wrapStyles.page}>
      <div className={wrapStyles.inner}>
        <h1 className={wrapStyles.heading}>Conversation Oversight</h1>
        <p className={wrapStyles.body}>Read-only view -- you cannot send messages here.</p>

        <div className={styles.messages}>
          <div className={styles.messagesInner}>
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={styles.row}>
                  <div className={styles.bubble}>
                    <p className={styles.bubbleText}>
                      <strong>{msg.senderName ?? "Participant"}:</strong> {msg.body}
                    </p>
                    <p className={styles.time}>{new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
