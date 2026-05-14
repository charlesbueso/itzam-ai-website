-- ============================================================================
-- Migration 0005 — admin-defined custom questions
--
-- Adds `is_custom` to public.questions so admins can append extra questions
-- on top of the seeded base set (without those extras being mistaken for
-- base ones if the base template ever changes).
--
-- Defaults to false so all existing rows (seeded from BASE_QUESTIONS) remain
-- non-custom.
-- ============================================================================

alter table public.questions
  add column if not exists is_custom boolean not null default false;
