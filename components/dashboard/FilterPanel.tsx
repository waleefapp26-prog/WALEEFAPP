"use client";

import { useState } from "react";
import { Button, Modal, Tag, TextField } from "@/components/ui";
import { EDUCATION_OPTIONS, INTEREST_OPTIONS } from "@/lib/config/interests";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { CandidateFilters } from "@/lib/queries/profiles";
import styles from "@/styles/features/filter-panel.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  value: CandidateFilters;
  onApply: (filters: CandidateFilters) => void;
};

export function FilterPanel({ open, onClose, value, onApply }: Props) {
  const { dictionary } = useTranslation();
  const [ageMin, setAgeMin] = useState(value.ageMin?.toString() ?? "");
  const [ageMax, setAgeMax] = useState(value.ageMax?.toString() ?? "");
  const [location, setLocation] = useState(value.location ?? "");
  const [education, setEducation] = useState(value.education ?? "");
  const [interests, setInterests] = useState<string[]>(value.interests ?? []);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]));
  };

  const handleApply = () => {
    onApply({
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
      location: location || undefined,
      education: education || undefined,
      interests: interests.length > 0 ? interests : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setAgeMin("");
    setAgeMax("");
    setLocation("");
    setEducation("");
    setInterests([]);
    onApply({});
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={dictionary.filterPanel.title}>
      <div className={styles.body}>
        <div>
          <span className={styles.fieldLabel}>{dictionary.filterPanel.ageRange}</span>
          <div className={styles.ageRow}>
            <TextField
              className={styles.ageField}
              type="number"
              placeholder={dictionary.filterPanel.min}
              value={ageMin}
              onValueChange={setAgeMin}
            />
            <TextField
              className={styles.ageField}
              type="number"
              placeholder={dictionary.filterPanel.max}
              value={ageMax}
              onValueChange={setAgeMax}
            />
          </div>
        </div>

        <TextField
          label={dictionary.filterPanel.location}
          placeholder={dictionary.filterPanel.locationPlaceholder}
          value={location}
          onValueChange={setLocation}
        />

        <div>
          <span className={styles.fieldLabel}>{dictionary.filterPanel.education}</span>
          <div className={styles.tagRow}>
            {EDUCATION_OPTIONS.map((option) => (
              <Tag
                key={option}
                label={option}
                selected={education === option}
                onClick={() => setEducation(education === option ? "" : option)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className={styles.fieldLabel}>{dictionary.filterPanel.interests}</span>
          <div className={styles.tagRow}>
            {INTEREST_OPTIONS.map((option) => (
              <Tag
                key={option}
                label={option}
                selected={interests.includes(option)}
                onClick={() => toggleInterest(option)}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="secondary" className={styles.actionBtn} onClick={handleReset}>
            {dictionary.common.reset}
          </Button>
          <Button type="button" className={styles.actionBtn} onClick={handleApply}>
            {dictionary.common.apply}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
