"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createSuccessStory,
  deleteSuccessStory,
  setStoryApproval,
} from "@/app/admin/success-stories/actions";
import { Button, Card, Textarea, TextField } from "@/components/ui";
import type { SuccessStory } from "@/lib/queries/successStories";
import styles from "@/styles/features/admin.module.css";

type Props = {
  stories: SuccessStory[];
};

const EMPTY = {
  coupleName: "",
  coupleNameAr: "",
  location: "",
  locationAr: "",
  storyEn: "",
  storyAr: "",
  consented: false,
};

export function AdminSuccessStoriesScreen({ stories }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(EMPTY);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setPending(true);
    setError(undefined);
    const result = await fn();
    setPending(false);
    if (!result.success) setError(result.error);
    else router.refresh();
    return result.success;
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Success stories</h1>
        <p className={styles.sub}>
          Only stories marked both consented and published appear on the site. Nothing here is invented —
          the landing page shows no stories at all until you publish a real one.
        </p>
        {error ? <p className={styles.sub}>{error}</p> : null}

        <Card>
          <h3 className={styles.rowName}>Add a story</h3>
          <div className={styles.formGrid}>
            <TextField
              label="Couple name (shown publicly)"
              value={draft.coupleName}
              onValueChange={(v) => setDraft({ ...draft, coupleName: v })}
              placeholder="A & F"
            />
            <TextField
              label="Couple name — Arabic"
              value={draft.coupleNameAr}
              onValueChange={(v) => setDraft({ ...draft, coupleNameAr: v })}
            />
            <TextField
              label="Location"
              value={draft.location}
              onValueChange={(v) => setDraft({ ...draft, location: v })}
              placeholder="Doha, Qatar"
            />
            <TextField
              label="Location — Arabic"
              value={draft.locationAr}
              onValueChange={(v) => setDraft({ ...draft, locationAr: v })}
            />
          </div>
          <Textarea
            placeholder="Their story, in their words (English)"
            value={draft.storyEn}
            onChange={(e) => setDraft({ ...draft, storyEn: e.target.value })}
          />
          <Textarea
            placeholder="Their story — Arabic"
            value={draft.storyAr}
            onChange={(e) => setDraft({ ...draft, storyAr: e.target.value })}
          />
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={draft.consented}
              onChange={(e) => setDraft({ ...draft, consented: e.target.checked })}
            />
            <span>The couple agreed in writing to publish this.</span>
          </label>
          <Button
            type="button"
            disabled={pending}
            onClick={async () => {
              if (await run(() => createSuccessStory(draft))) setDraft(EMPTY);
            }}
          >
            Save as draft
          </Button>
        </Card>

        <h2 className={styles.rowName}>{stories.length} stored</h2>
        {stories.length === 0 ? (
          <p className={styles.sub}>No stories yet.</p>
        ) : (
          <div className={styles.cardList}>
            {stories.map((story) => (
              <Card key={story.id}>
                <div className={styles.rowMain}>
                  <p className={styles.rowName}>{story.coupleName}</p>
                  <p className={styles.rowMeta}>{story.location ?? "—"}</p>
                  <p className={styles.rowMeta}>{story.storyEn}</p>
                  <p className={styles.rowMeta}>
                    {story.consented ? "consented" : "NO CONSENT"} ·{" "}
                    {story.approved ? "published" : "draft"}
                  </p>
                </div>
                <div className={styles.rowActions}>
                  {/* Publishing without consent is blocked here rather than
                      relying on the reader-side filter alone. */}
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    disabled={pending || !story.consented}
                    onClick={() => void run(() => setStoryApproval(story.id, !story.approved))}
                  >
                    {story.approved ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    type="button"
                    size="md"
                    variant="outline"
                    disabled={pending}
                    onClick={() => void run(() => deleteSuccessStory(story.id))}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
