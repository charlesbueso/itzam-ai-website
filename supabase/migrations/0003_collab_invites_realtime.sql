-- 0003 — Pending collaborator invites (by email) + realtime publication
-- for live-editing answers ("almost realtime, last write wins").

begin;

-- Pending invites. A row is removed once the invitee redeems and gets
-- attached to `questionnaire_collaborators`.
create table if not exists public.questionnaire_collaborator_invites (
  questionnaire_id    uuid not null
    references public.questionnaires(id) on delete cascade,
  email               citext not null,
  invited_by_user_id  uuid references auth.users(id) on delete set null,
  invited_at          timestamptz not null default now(),
  primary key (questionnaire_id, email)
);

create index if not exists idx_qci_q
  on public.questionnaire_collaborator_invites(questionnaire_id);

alter table public.questionnaire_collaborator_invites enable row level security;

-- Collaborators (and the original assignee) can read the invite list for
-- "their" questionnaire. Mutations are service-role only.
drop policy if exists qci_collab_select on public.questionnaire_collaborator_invites;
create policy qci_collab_select on public.questionnaire_collaborator_invites
  for select to authenticated
  using (
    exists (
      select 1 from public.questionnaires q
      where q.id = questionnaire_collaborator_invites.questionnaire_id
        and (
          q.assigned_user_id = auth.uid()
          or exists (
            select 1 from public.questionnaire_collaborators c
            where c.questionnaire_id = q.id and c.user_id = auth.uid()
          )
        )
    )
  );

-- Realtime publication: enable INSERT/UPDATE/DELETE notifications on
-- `answers` so the form can reflect collaborator edits live.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'answers'
  ) then
    execute 'alter publication supabase_realtime add table public.answers';
  end if;
end $$;

commit;
