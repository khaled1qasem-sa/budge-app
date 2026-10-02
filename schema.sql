-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.docs (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  col text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, col, id)
);
alter table public.docs enable row level security;
create policy "own rows" on public.docs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
alter publication supabase_realtime add table public.docs;
