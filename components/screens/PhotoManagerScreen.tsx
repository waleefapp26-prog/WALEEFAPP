"use client";

import { useRef, useState } from "react";
import { Star, Trash2, Upload } from "lucide-react";
import { Button, Card, PhotoImage } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { deletePhoto, getPhotosForUser, setMainPhoto, updatePhotoVisibility } from "@/lib/queries/photos";
import { respondToAccessRequest } from "@/lib/queries/photoAccessRequests";
import type { PhotoVisibility, ProfilePhoto } from "@/lib/types/photo";
import type { PhotoAccessRequest } from "@/lib/types/photoAccessRequest";
import styles from "@/styles/features/photo-manager.module.css";
import { PhotoVisibilityPanel } from "@/components/dashboard/PhotoVisibilityPanel";

type Props = {
  userId: string;
  initialPhotos: ProfilePhoto[];
  initialAccessRequests: PhotoAccessRequest[];
};

export function PhotoManagerScreen({ userId, initialPhotos, initialAccessRequests }: Props) {
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const VISIBILITY_LABELS: Record<PhotoVisibility, string> = {
    public: dictionary.photoVisibility.public,
    matched: dictionary.photoVisibility.afterMatch,
    approved: dictionary.photoVisibility.afterApproval,
    hidden: dictionary.photoVisibility.hidden,
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [accessRequests, setAccessRequests] = useState(initialAccessRequests);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [visibilityTarget, setVisibilityTarget] = useState<ProfilePhoto | null>(null);

  const refreshPhotos = async () => {
    const next = await getPhotosForUser(supabase, userId);
    setPhotos(next);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(undefined);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("profile-photos").upload(path, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("profile_photos").insert({
        user_id: userId,
        storage_path: path,
        is_main: photos.length === 0,
      });
      if (insertError) throw insertError;

      await refreshPhotos();
    } catch (err) {
      console.error("Failed to upload photo", err);
      setError(dictionary.auth.genericError);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetMain = async (photoId: string) => {
    try {
      await setMainPhoto(supabase, userId, photoId);
      await refreshPhotos();
    } catch (err) {
      console.error("Failed to set main photo", err);
    }
  };

  const handleDelete = async (photoId: string) => {
    try {
      await deletePhoto(supabase, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error("Failed to delete photo", err);
    }
  };

  const handleVisibilityChange = async (visibility: PhotoVisibility) => {
    if (!visibilityTarget) return;
    try {
      await updatePhotoVisibility(supabase, visibilityTarget.id, visibility);
      await refreshPhotos();
    } catch (err) {
      console.error("Failed to update visibility", err);
    }
  };

  const handleRequestResponse = async (requestId: string, status: "approved" | "declined") => {
    setAccessRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      await respondToAccessRequest(supabase, requestId, status);
    } catch (err) {
      console.error("Failed to respond to access request", err);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{dictionary.photos.title}</h1>
        <p className={styles.sub}>{dictionary.photos.sub}</p>

        {accessRequests.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{dictionary.photos.requestsToView}</h2>
            {accessRequests.map((request) => (
              <div key={request.id} className={styles.requestRow}>
                <span>{dictionary.photos.someoneWantsView}</span>
                <div className={styles.requestActions}>
                  <Button size="md" variant="secondary" onClick={() => void handleRequestResponse(request.id, "declined")}>
                    {dictionary.photos.decline}
                  </Button>
                  <Button size="md" onClick={() => void handleRequestResponse(request.id, "approved")}>
                    {dictionary.photos.approve}
                  </Button>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{dictionary.photos.yourPhotos}</h2>
          <div className={styles.grid}>
            {photos.map((photo) => (
              <Card key={photo.id} className={styles.photoCard}>
                <div className={styles.thumbWrap}>
                  {photo.isMain ? <span className={styles.mainBadge}>{dictionary.photos.main}</span> : null}
                  <PhotoImage photoId={photo.id} alt="" className={styles.thumb} />
                </div>
                <div className={styles.metaRow}>
                  <span>{VISIBILITY_LABELS[photo.visibility]}</span>
                  <span>{photo.moderationStatus}</span>
                </div>
                <div className={styles.actionRow}>
                  {!photo.isMain ? (
                    <Button size="md" variant="outline" onClick={() => void handleSetMain(photo.id)}>
                      <Star size={14} aria-hidden /> {dictionary.photos.main}
                    </Button>
                  ) : null}
                  <Button size="md" variant="outline" onClick={() => setVisibilityTarget(photo)}>
                    {dictionary.photos.visibility}
                  </Button>
                  <Button size="md" variant="secondary" onClick={() => void handleDelete(photo.id)}>
                    <Trash2 size={14} aria-hidden />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className={styles.uploadWrap}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleUpload(file);
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload size={16} aria-hidden /> {uploading ? dictionary.photos.uploading : dictionary.photos.uploadPhoto}
          </Button>
        </div>
        {error ? <p style={{ color: "#d9364a", marginTop: "0.75rem" }}>{error}</p> : null}
      </div>

      {visibilityTarget ? (
        <PhotoVisibilityPanel
          open={!!visibilityTarget}
          onClose={() => setVisibilityTarget(null)}
          value={visibilityTarget.visibility}
          onApply={handleVisibilityChange}
        />
      ) : null}
    </div>
  );
}
