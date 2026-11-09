create table if not exists public.visitors (
  id uuid primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  name text,
  company text,
  role text,
  source text,
  language text,
  user_agent text
);

create table if not exists public.conversations (
  id uuid primary key,
  visitor_id uuid references public.visitors(id),
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count integer not null default 0,
  backend text not null default 'gemini'
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  visitor_id uuid references public.visitors(id),
  name text not null,
  company text,
  role text,
  email text,
  phone text,
  message text,
  created_at timestamptz not null default now(),
  constraint leads_contact_required check (email is not null or phone is not null)
);

alter table public.visitors enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.leads enable row level security;

-- RLS has no policies. The browser roles have no table or identity-sequence grants.
revoke all on table public.visitors, public.conversations, public.messages, public.leads
  from public, anon, authenticated;
grant all on table public.visitors, public.conversations, public.messages, public.leads
  to service_role;
revoke all on sequence public.messages_id_seq, public.leads_id_seq
  from public, anon, authenticated;
grant usage, select on sequence public.messages_id_seq, public.leads_id_seq
  to service_role;

-- Preserve previously declared visitor details when a later request omits them.
create or replace function public.upsert_visitor(
  p_id uuid,
  p_name text,
  p_company text,
  p_role text,
  p_source text,
  p_language text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.visitors as existing_visitor
    (id, last_seen_at, name, company, role, source, language, user_agent)
  values (p_id, now(), p_name, p_company, p_role, p_source, p_language, null)
  on conflict (id) do update
  set last_seen_at = now(),
      name = coalesce(excluded.name, existing_visitor.name),
      company = coalesce(excluded.company, existing_visitor.company),
      role = coalesce(excluded.role, existing_visitor.role),
      source = coalesce(excluded.source, existing_visitor.source),
      language = coalesce(excluded.language, existing_visitor.language);
end;
$$;

revoke all on function public.upsert_visitor(uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.upsert_visitor(uuid, text, text, text, text, text)
  to service_role;

-- Keep message_count correct if two chat requests arrive at the same time.
create or replace function public.increment_conversation_message_count(
  p_conversation_id uuid,
  p_message_delta integer
)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.conversations
  set message_count = message_count + greatest(p_message_delta, 0),
      last_message_at = now()
  where id = p_conversation_id;
$$;

revoke all on function public.increment_conversation_message_count(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.increment_conversation_message_count(uuid, integer)
  to service_role;
