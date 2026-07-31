"use client";

import { useState } from "react";
import { Button, Modal, Tag } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { PhotoVisibility } from "@/lib/types/photo";
import styles from "@/styles/features/filter-panel.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  value: PhotoVisibility;
  onApply: (visibility: PhotoVisibility) => void;
};

export function PhotoVisibilityPanel({ open, onClose, value, onApply }: Props) {
  const { dictionary } = useTranslation();
  const [selected, setSelected] = useState<PhotoVisibility>(value);

  const VISIBILITY_OPTIONS: { value: PhotoVisibility; label: string }[] = [
    { value: "public", label: dictionary.photoVisibility.public },
    { value: "matched", label: dictionary.photoVisibility.afterMatch },
    { value: "approved", label: dictionary.photoVisibility.afterApproval },
    { value: "hidden", label: dictionary.photoVisibility.hidden },
  ];

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={dictionary.photoVisibility.title}>
      <div className={styles.body}>
        <div>
          <span className={styles.fieldLabel}>{dictionary.photoVisibility.whoCanSee}</span>
          <div className={styles.tagRow}>
            {VISIBILITY_OPTIONS.map((option) => (
              <Tag
                key={option.value}
                label={option.label}
                selected={selected === option.value}
                onClick={() => setSelected(option.value)}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" className={styles.actionBtn} onClick={onClose}>
            {dictionary.common.cancel}
          </Button>
          <Button type="button" className={styles.actionBtn} onClick={handleApply}>
            {dictionary.common.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
