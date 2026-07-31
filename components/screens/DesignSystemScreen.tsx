"use client";

import { useState } from "react";
import { Badge, Button, Card, FormField, Input, MatchPercentage, ProgressBar, Tag, Toggle } from "@/components/ui";
import styles from "@/styles/features/design-system.module.css";

const demoTags = ["Reading", "Sports", "Travel", "Cooking", "Art"];

export function DesignSystemScreen() {
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.section}>
          <h1 className={styles.heroTitle}>Waleef Design System</h1>
          <p className={styles.heroSub}>Complete UI kit — production-ready components</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Color palette</h2>
          <div className={styles.grid4}>
            <Card>
              <div className={`${styles.swatch} ${styles.gradPrimary}`} />
              <p className={styles.swatchLabel}>Primary gradient</p>
              <p className={styles.swatchMeta}>#FF6B9D → #FF8A5C</p>
            </Card>
            <Card>
              <div className={`${styles.swatch} ${styles.beige}`} />
              <p className={styles.swatchLabel}>Beige</p>
              <p className={styles.swatchMeta}>#F5F1E8</p>
            </Card>
            <Card>
              <div className={`${styles.swatch} ${styles.cream}`} />
              <p className={styles.swatchLabel}>Cream</p>
              <p className={styles.swatchMeta}>#FFF8F0</p>
            </Card>
            <Card>
              <div className={`${styles.swatch} ${styles.gradGold}`} />
              <p className={styles.swatchLabel}>Gold accent</p>
              <p className={styles.swatchMeta}>#D4AF37 → #E8C870</p>
            </Card>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <Card>
            <h1 className={styles.typoH1}>Heading 1 — Cormorant Garamond</h1>
            <h2 className={styles.typoH2}>Heading 2 — Cormorant Garamond</h2>
            <h3 className={styles.typoH3}>Heading 3 — Cormorant Garamond</h3>
            <p className={styles.typoBody}>Body text — Outfit</p>
            <p className={styles.typoMuted}>Secondary text — Outfit</p>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>
          <Card>
            <div className={styles.btnRow}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inputs</h2>
          <div className={styles.grid2}>
            <FormField label="Default input">
              <Input placeholder="Enter text..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            </FormField>
            <FormField label="Input with error" error="This field is required">
              <Input placeholder="Enter text..." invalid aria-invalid />
            </FormField>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cards</h2>
          <div className={styles.grid3}>
            <Card variant="default">
              <h4 style={{ margin: "0 0 0.5rem" }}>Default card</h4>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--waleef-text-secondary)" }}>
                Standard card with subtle shadow
              </p>
            </Card>
            <Card variant="profile">
              <h4 style={{ margin: "0 0 0.5rem" }}>Profile card</h4>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--waleef-text-secondary)" }}>User profiles</p>
            </Card>
            <Card variant="info">
              <h4 style={{ margin: "0 0 0.5rem" }}>Info card</h4>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--waleef-text-secondary)" }}>
                Gradient background
              </p>
            </Card>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges</h2>
          <Card>
            <div className={styles.btnRow}>
              <Badge variant="verified" />
              <Badge variant="premium" />
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Progress bar</h2>
          <Card>
            <ProgressBar currentStep={2} totalSteps={4} />
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Match percentage</h2>
          <Card>
            <div className={styles.matchRow}>
              <MatchPercentage percentage={85} size="sm" />
              <MatchPercentage percentage={92} size="md" />
              <MatchPercentage percentage={78} size="lg" />
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tags</h2>
          <Card>
            <div className={styles.tagRow}>
              {demoTags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() =>
                    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                  }
                />
              ))}
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Toggle</h2>
          <Card>
            <Toggle checked={toggleValue} onChange={setToggleValue} label="Enable notifications" />
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing (8px grid)</h2>
          <Card>
            <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "var(--waleef-text-secondary)" }}>
              Reference widths
            </p>
            <div className={styles.spacingDemo}>
              <div className={`${styles.bar} ${styles.w16}`} />
              <div className={`${styles.bar} ${styles.w24}`} />
              <div className={`${styles.bar} ${styles.w32}`} />
              <div className={`${styles.bar} ${styles.w48}`} />
            </div>
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Border radius</h2>
          <Card>
            <div className={styles.radiusGrid}>
              <div>
                <div className={`${styles.radiusBox} ${styles.r12}`} />
                <p className={styles.radiusLabel}>12px</p>
              </div>
              <div>
                <div className={`${styles.radiusBox} ${styles.r16}`} />
                <p className={styles.radiusLabel}>16px</p>
              </div>
              <div>
                <div className={`${styles.radiusBox} ${styles.r20}`} />
                <p className={styles.radiusLabel}>20px</p>
              </div>
              <div>
                <div className={`${styles.radiusBox} ${styles.r24}`} />
                <p className={styles.radiusLabel}>24px</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
