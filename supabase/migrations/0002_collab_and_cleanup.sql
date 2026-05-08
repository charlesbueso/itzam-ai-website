-- 0002 — Multi-collaborator + cleanup of unused token fields.
--
-- Background:
-- After moving to SSR PKCE-style invite redemption (verifyOtp on the server,
-- HttpOnly cookies via @supabase/ssr) we no longer pre-generate or store
-- `supabase_action_link`. We also removed the per-link uses cap, so
-- `invite_token_max_uses` is dead too.
--
-- The product requirement also evolved: the invite link should now bring the
-- user to a sign-up form (email + password, with email verification). Anyone
-- who completes sign-up via the same invite becomes a *collaborator* on the
-- questionnaire, alongside the original recipient.

begin;

-- 1. Drop unused columns. Safe — service-role only and no FK.
alter table public.questionnaires
  drop column if exists supabase_action_link,
  drop column if exists invite_token_max_uses;

-- 2. Multi-collaborator join table.
create table if not exists public.questionnaire_collaborators (
  questionnaire_id uuid not null
    references public.questionnaires(id) on delete cascade,
  user_id          uuid not null
    references auth.users(id) on delete cascade,
  joined_at        timestamptz not null default now(),
  primary key (questionnaire_id, user_id)
);

create index if not exists idx_qc_user
  on public.questionnaire_collaborators(user_id);

alter table public.questionnaire_collaborators enable row level security;

-- Users can see only their own collaborator rows. Mutations are service-role
-- only (the invite redeem route inserts).
drop policy if exists qc_self_select on public.questionnaire_collaborators;
create policy qc_self_select on public.questionnaire_collaborators
  for select to authenticated
  using (user_id = auth.uid());

-- 3. Update RLS so collaborators get the same read/write power as the
--    original assigned_user_id.

drop policy if exists q_client_select on public.questionnaires;
create policy q_client_select on public.questionnaires
  for select to authenticated
  using (
    assigned_user_id = auth.uid()
    or exists (
      select 1 from public.questionnaire_collaborators c
      where c.questionnaire_id = id and c.user_id = auth.uid()
    )
  );

drop policy if exists q_client_update on public.questionnaires;
create policy q_client_update on public.questionnaires
  for update to authenticated
  using (
    assigned_user_id = auth.uid()
    or exists (
      select 1 from public.questionnaire_collaborators c
      where c.questionnaire_id = id and c.user_id = auth.uid()
    )
  )
  with check (
    assigned_user_id = auth.uid()
    or exists (
      select 1 from public.questionnaire_collaborators c
      where c.questionnaire_id = id and c.user_id = auth.uid()
    )
  );

drop policy if exists qu_client_select on public.questions;
create policy qu_client_select on public.questions
  for select to authenticated
  using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id
        and (
          q.assigned_user_id = auth.uid()
          or exists (
            select 1 from public.questionnaire_collaborators c
            where c.questionnaire_id = q.id and c.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists ans_client_select on public.answers;
create policy ans_client_select on public.answers
  for select to authenticated
  using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id
        and (
          q.assigned_user_id = auth.uid()
          or exists (
            select 1 from public.questionnaire_collaborators c
            where c.questionnaire_id = q.id and c.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists ans_client_insert on public.answers;
create policy ans_client_insert on public.answers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id
        and (
          q.assigned_user_id = auth.uid()
          or exists (
            select 1 from public.questionnaire_collaborators c
            where c.questionnaire_id = q.id and c.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists ans_client_update on public.answers;
create policy ans_client_update on public.answers
  for update to authenticated
  using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id
        and (
          q.assigned_user_id = auth.uid()
          or exists (
            select 1 from public.questionnaire_collaborators c
            where c.questionnaire_id = q.id and c.user_id = auth.uid()
          )
        )
    )
  )
  with check (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_id
        and (
          q.assigned_user_id = auth.uid()
          or exists (
            select 1 from public.questionnaire_collaborators c
            where c.questionnaire_id = q.id and c.user_id = auth.uid()
          )
        )
    )
  );

commit;
