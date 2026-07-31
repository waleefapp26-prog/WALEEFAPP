import { Heart, X } from "lucide-react";
import styles from "@/styles/features/dashboard-deck.module.css";

type Props = {
  onPass: () => void;
  onLike: () => void;
};

export function MatchDeckActions({ onPass, onLike }: Props) {
  return (
    <div className={styles.actions}>
      <button type="button" className={styles.passBtn} onClick={onPass} aria-label="Pass">
        <X size={32} className={styles.passIcon} />
      </button>
      <button type="button" className={styles.likeBtn} onClick={onLike} aria-label="Like">
        <Heart size={36} className={styles.likeIcon} />
      </button>
    </div>
  );
}
