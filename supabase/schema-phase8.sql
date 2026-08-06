-- ---------------------------------------------------------------------------
-- Waleef schema phase 8 -- data only, no structural change. Safe to re-run.
--
-- Make the browsing deck able to show a real compatibility score.
--
-- Scoring only ever considered questions in the 'compatibility' and 'optional'
-- sections, and those unlock only after a mutual match. The deck, by
-- definition, shows people you have NOT matched -- so neither party had
-- answered anything comparable and every card read "--". The number the whole
-- product is built around was structurally unreachable on its main screen.
--
-- The 22 registration questions are answered by everyone at signup, but all
-- carried match_bucket = null, which excluded them. This tags the four where
-- two people genuinely agreeing is what matters:
--
--   sect / madhhab orientation        religion,  weight 5
--   commitment to religious duties    religion,  weight 5
--   do you want children?             family,    weight 4
--   family involvement in the search  family,    weight 3
--
-- Deliberately NOT tagged: gender (partners should differ, so sameness is the
-- wrong test), skin tone and appearance (a preference, not an agreement),
-- education, finance, employment and health (scoring members on wealth or
-- schooling is not something this platform should assert compatibility from),
-- and marital status (two divorced people are not thereby more compatible).
--
-- Scoring now keys off match_bucket rather than section, so which questions
-- count is data, not code: tag a question here and it starts counting.
-- ---------------------------------------------------------------------------

update public.questions set match_bucket = 'religion', importance = 5
where slug = 'onb_religion_sect_orientation';

update public.questions set match_bucket = 'religion', importance = 5
where slug = 'onb_religion_commitment_level';

update public.questions set match_bucket = 'family', importance = 4
where slug = 'onb_social_want_children';

update public.questions set match_bucket = 'family', importance = 3
where slug = 'onb_family_search_involvement';

select slug, section, match_bucket, importance
from public.questions
where section = 'onboarding' and match_bucket is not null
order by slug;
