"use client";

import { useState } from "react";
import { setPhotoModeration } from "@/app/admin/photos/actions";
import { Button, Card, PhotoImage } from "@/components/ui";
import type { PhotoModerationStatus } from "@/lib/types/photo";
import styles from "@/styles/features/admin.module.css";

export type AdminPhoto = {
  id: string;
  userId: string;
  ownerName: string | null;
  visibility: string;
  moderationStatus: PhotoModerationStatus;
  isMain: boolean;
  createdAt: string;
};

type Props = {
  photos: AdminPhoto[];
};

/** Post-moderation queue: photos are live on upload, and this is where one
 *  gets taken down. Pre-moderation was the old behaviour and it silently made
 *  every photo invisible forever, because this screen didn't exist. */
export function AdminPhotosScreen({ photos }: Props) {
  const [statuses, setStatuses] = useState<Record<string, PhotoModerationStatus>>(
    Object.fromEntries(photos.map((p) => [p.id, p.moderationStatus])),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const update = async (photoId: string, status: PhotoModerationStatus) => {
    setPending(photoId);
    setError(undefined);
    const result = await setPhotoModeration(photoId, status);
    setPending(null);
    if (result.success) setStatuses((prev) => ({ ...prev, [photoId]: status }));
    else setError(result.error);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Photos</h1>
        <p className={styles.sub}>{photos.length} total — photos go live on upload; reject to take one down.</p>
        {error ? <p className={styles.sub}>{error}</p> : null}

        {photos.length === 0 ? (
          <p className={styles.sub}>No photos uploaded yet.</p>
        ) : (
          <div className={styles.cardList}>
            {photos.map((photo) => {
              const status = statuses[photo.id];
              return (
                <Card key={photo.id}>
                  <div className={styles.photoRow}>
                    <PhotoImage photoId={photo.id} alt="" className={styles.photoThumb} />
                    <div className={styles.rowMain}>
                      <p className={styles.rowName}>
                        {photo.ownerName ?? "Unknown"}
                        {photo.isMain ? " — main" : ""}
                      </p>
                      <p className={styles.rowMeta}>
                        visibility: {photo.visibility} · status: {status}
                      </p>
                      <p className={styles.rowMeta}>{new Date(photo.createdAt).toLocaleString()}</p>
                    </div>
                    <div className={styles.rowActions}>
                      {status === "rejected" ? (
                        <Button
                          type="button"
                          size="md"
                          variant="outline"
                          disabled={pending === photo.id}
                          onClick={() => void update(photo.id, "approved")}
                        >
                          Restore
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="md"
                          variant="outline"
                          disabled={pending === photo.id}
                          onClick={() => void update(photo.id, "rejected")}
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
