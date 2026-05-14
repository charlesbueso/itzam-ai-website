-- 0006_hubspot_job_kind.sql
-- Extend the submission_jobs.kind enum to include 'hubspot'.
-- This job upserts the questionnaire client as a HubSpot CRM contact and
-- creates a deal in the default pipeline. Idempotent thanks to the existing
-- UNIQUE(questionnaire_id, kind) constraint.

alter type job_kind add value if not exists 'hubspot';
