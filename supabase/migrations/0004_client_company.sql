-- ============================================================================
-- Migration 0004 — split contact name from company name
--
-- `client_name` was being used both for emails ("Hi <name>") and as the
-- Drive root folder. Splitting:
--   • client_name    → person's name, used in client-facing emails.
--   • client_company → company / organization, shown to the client in the
--                      questionnaire UI and used as the Drive root folder.
-- Existing rows get `client_company` backfilled from `client_name` so the
-- Drive folder layout doesn't shift under deployed data.
-- ============================================================================

alter table public.questionnaires
  add column if not exists client_company text;

update public.questionnaires
   set client_company = client_name
 where client_company is null;

alter table public.questionnaires
  alter column client_company set not null;

-- Length cap mirrors client_name's effective use.
alter table public.questionnaires
  add constraint questionnaires_client_company_len
    check (char_length(client_company) between 1 and 200);
