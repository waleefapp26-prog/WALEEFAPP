"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { computePlaceholderScore } from "@/lib/matching/placeholderScore";
import { getCandidateProfiles, type CandidateFilters } from "@/lib/queries/profiles";
import type { Profile } from "@/lib/types/profile";
import styles from "@/styles/features/dashboard-deck.module.css";
import { FilterPanel } from "./FilterPanel";
import { MatchDeckActions } from "./MatchDeckActions";
import { MatchProfileCard } from "./MatchProfileCard";
import { QuickActions } from "./QuickActions";

type Props = {
  isAdmin?: boolean;
  initialCandidates: Profile[];
  currentUserId: string;
};

export function DashboardScreen({ initialCandidates, currentUserId, isAdmin = false }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const { dictionary } = useTranslation();
  const [profiles, setProfiles] = useState(initialCandidates);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CandidateFilters>({});
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const advance = () => {
    setCurrentIndex((i) => (i < profiles.length - 1 ? i + 1 : profiles.length));
  };

  const currentProfile = profiles[currentIndex];

  const handleApplyFilters = async (nextFilters: CandidateFilters) => {
    setFilters(nextFilters);
    setLoadingCandidates(true);
    try {
      const candidates = await getCandidateProfiles(supabase, 20, nextFilters);
      setProfiles(candidates);
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load filtered candidates", err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleSwipe = async (action: "like" | "pass") => {
    if (!currentProfile || busy) return;
    setBusy(true);

    try {
      const { error: swipeError } = await supabase
        .from("swipes")
        .insert({ actor_id: currentUserId, target_id: currentProfile.id, action });

      if (swipeError) {
        console.error("Failed to record swipe", swipeError);
        advance();
        return;
      }

      if (action === "like") {
        const [lo, hi] = [currentUserId, currentProfile.id].sort();
        const { data: match } = await supabase
          .from("matches")
          .select("id")
          .eq("user_a", lo)
          .eq("user_b", hi)
          .maybeSingle();

        if (match) {
          router.push(`/dashboard/match-result/${match.id}`);
          return;
        }
      }

      advance();
    } catch (err) {
      console.error("Failed to process swipe", err);
      advance();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          {/* Brand now lives in the top bar / side rail, so the deck heading
              is the page title rather than a second copy of the logo. */}
          <h1 className={styles.pageTitle}>{dictionary.dashboardNav.matches}</h1>
          <button
            type="button"
            className={styles.filterBtn}
            onClick={() => setFiltersOpen(true)}
            aria-label={dictionary.deck.filterMatches}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
        <p className={styles.sub}>{loadingCandidates ? dictionary.deck.loadingMatches : dictionary.deck.todaysMatches}</p>
        {/* Was four stacked underlined links; same destinations, but as
            scannable icon chips instead of a wall of sentences. */}
        <QuickActions isAdmin={isAdmin} />
      </header>

      <FilterPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={handleApplyFilters}
      />

      <div className={styles.stack}>
        {currentProfile ? (
          <div key={currentProfile.id} className={styles.cardMotion}>
            <Link href={`/dashboard/profile/${currentProfile.id}`} className={styles.profileLink}>
              <MatchProfileCard
                profile={currentProfile}
                matchPercentage={computePlaceholderScore(currentUserId, currentProfile.id)}
              />
            </Link>
          </div>
        ) : (
          /* The empty state is what most users see most days, so it gets a
             designed card rather than an icon floating in a void. */
          <div className={styles.empty}>
            <div className={styles.emptyGlow} aria-hidden />
            <Image
              src="/images/logo.png"
              alt=""
              width={96}
              height={96}
              className={styles.emptyMark}
            />
            <h3 className={styles.emptyTitle}>{dictionary.deck.noMoreMatches}</h3>
            <p className={styles.emptyBody}>{dictionary.deck.checkBackTomorrow}</p>
            <div className={styles.emptyActions}>
              <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={16} aria-hidden />
                {dictionary.deck.filterMatches}
              </Button>
              <Button href="/dashboard/questionnaire">{dictionary.quickActions.quiz}</Button>
            </div>
          </div>
        )}
      </div>

      {currentProfile ? (
        <>
          <p className={styles.matchInsight}>
            <Link href={`/dashboard/profile/${currentProfile.id}`}>{dictionary.deck.seeWhyStrongMatch}</Link>
          </p>
          <MatchDeckActions onPass={() => handleSwipe("pass")} onLike={() => handleSwipe("like")} />
        </>
      ) : null}
    </div>
  );
}
