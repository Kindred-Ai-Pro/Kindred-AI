-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'New Reflection',
  content text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chats_user_id_idx on public.chats (user_id);
create index if not exists chats_updated_at_idx on public.chats (updated_at desc);

-- Optional: keep updated_at fresh on edits
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists chats_set_updated_at on public.chats;
create trigger chats_set_updated_at
before update on public.chats
for each row execute function public.set_updated_at();
