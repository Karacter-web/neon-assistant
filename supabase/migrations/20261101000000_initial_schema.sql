-- Karacter AI foundation schema.
-- Review against the connected project's current schema before applying; this repository
-- has no project link/configuration, so this migration has intentionally not been applied.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'New conversation' check (char_length(title) between 1 and 160),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_id_user_id_unique unique (id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint messages_user_matches_conversation
    foreign key (conversation_id, user_id)
    references public.conversations (id, user_id)
    on delete cascade
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 255),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'processing', 'ready', 'failed')),
  extracted_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint attachments_user_matches_conversation
    foreign key (conversation_id, user_id)
    references public.conversations (id, user_id)
    on delete cascade
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  timezone text not null default 'UTC',
  preferred_model text,
  preferred_voice_provider text not null default 'deepgram'
    check (preferred_voice_provider in ('deepgram', 'elevenlabs')),
  language text not null default 'en',
  updated_at timestamptz not null default now()
);

create index conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);
create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index messages_user_created_idx
  on public.messages (user_id, created_at desc);
create index attachments_conversation_idx
  on public.attachments (conversation_id, created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();
create trigger preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;
alter table public.user_preferences enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy conversations_select_own on public.conversations
  for select to authenticated using (user_id = (select auth.uid()));
create policy conversations_insert_own on public.conversations
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy conversations_update_own on public.conversations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy conversations_delete_own on public.conversations
  for delete to authenticated using (user_id = (select auth.uid()));

create policy messages_select_own on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = (select auth.uid())
    )
  );
create policy messages_insert_user_own on public.messages
  for insert to authenticated
  with check (
    role = 'user'
    and user_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = (select auth.uid())
    )
  );

create policy attachments_select_own on public.attachments
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy attachments_insert_own on public.attachments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = attachments.conversation_id and c.user_id = (select auth.uid())
    )
  );
create policy attachments_delete_own on public.attachments
  for delete to authenticated using (user_id = (select auth.uid()));

create policy user_preferences_select_own on public.user_preferences
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_preferences_insert_own on public.user_preferences
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy user_preferences_update_own on public.user_preferences
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Browser users may only add user messages. Assistant output and document-processing
-- updates are reserved for trusted server-side functions using narrowly scoped credentials.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert, delete on public.attachments to authenticated;
grant select, insert, update on public.user_preferences to authenticated;
