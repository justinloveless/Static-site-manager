-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles table to extend auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Sites managed through the platform
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  repo_full_name text not null,
  default_branch text not null,
  github_installation_id bigint not null,
  github_app_slug text,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sites_repo_full_name_idx on public.sites (repo_full_name);

alter table public.sites enable row level security;

-- Site members with roles
create table public.site_members (
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (site_id, user_id)
);

alter table public.site_members enable row level security;

create index site_members_user_idx on public.site_members (user_id);

-- Batches of changes committed together
create table public.change_batches (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete restrict,
  state text not null check (state in ('open', 'committing', 'complete', 'failed')) default 'open',
  commit_sha text,
  commit_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index change_batches_site_idx on public.change_batches (site_id);

alter table public.change_batches enable row level security;

-- Asset versions staged for deployment
create table public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  storage_path text not null,
  repo_path text not null,
  file_size_bytes integer not null check (file_size_bytes >= 0),
  checksum text,
  status text not null check (status in ('pending', 'staged', 'committing', 'committed', 'failed')),
  batch_id uuid references public.change_batches(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index asset_versions_site_idx on public.asset_versions (site_id);
create index asset_versions_batch_idx on public.asset_versions (batch_id);

alter table public.asset_versions enable row level security;

-- Activity audit log
create table public.activity_log (
  id bigint generated always as identity primary key,
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_site_idx on public.activity_log (site_id, created_at desc);

alter table public.activity_log enable row level security;

-- Helper function to validate site membership
create or replace function public.is_site_member(target_site_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.site_members sm
    where sm.site_id = target_site_id
      and sm.user_id = auth.uid()
  );
$$;

grant execute on function public.is_site_member(uuid) to authenticated, anon;

create or replace function public.is_site_member_from_path(object_name text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_site uuid;
begin
  target_site := split_part(object_name, '/', 1)::uuid;
  return public.is_site_member(target_site);
exception
  when others then
    return false;
end;
$$;

grant execute on function public.is_site_member_from_path(text) to authenticated, anon;

-- Row Level Security policies

create policy "Members can view sites"
  on public.sites
  for select
  using (
    public.is_site_member(id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Owners and managers can modify sites"
  on public.sites
  for update
  using (
    public.is_site_member(id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  )
  with check (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = public.sites.id
        and sm.user_id = auth.uid()
        and sm.role in ('owner', 'manager')
    )
  );

create policy "Service role can insert sites"
  on public.sites
  for insert
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "Members can list memberships"
  on public.site_members
  for select
  using (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Owners can manage memberships"
  on public.site_members
  for all
  using (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = public.site_members.site_id
        and sm.user_id = auth.uid()
        and sm.role = 'owner'
    )
  )
  with check (
    coalesce(auth.jwt() ->> 'role', '') = 'service_role'
    or exists (
      select 1
      from public.site_members sm
      where sm.site_id = public.site_members.site_id
        and sm.user_id = auth.uid()
        and sm.role = 'owner'
    )
  );

create policy "Service role manages memberships"
  on public.site_members
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

create policy "Members read asset versions"
  on public.asset_versions
  for select
  using (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Members insert/update their asset versions"
  on public.asset_versions
  for insert
  with check (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Members update their asset versions"
  on public.asset_versions
  for update
  using (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Members read change batches"
  on public.change_batches
  for select
  using (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Members manage their change batches"
  on public.change_batches
  for all
  using (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  )
  with check (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Members read activity log"
  on public.activity_log
  for select
  using (
    public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

create policy "Service role writes activity log"
  on public.activity_log
  for insert
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Timestamps triggers for updated_at columns
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_sites_updated_at
  before update on public.sites
  for each row
  execute function public.set_current_timestamp_updated_at();

create trigger set_change_batches_updated_at
  before update on public.change_batches
  for each row
  execute function public.set_current_timestamp_updated_at();

create trigger set_asset_versions_updated_at
  before update on public.asset_versions
  for each row
  execute function public.set_current_timestamp_updated_at();

-- Storage access policies for site assets

create policy "Service role manages storage"
  on storage.objects
  for all
  using (coalesce(auth.jwt() ->> 'role', '') = 'service_role')
  with check (coalesce(auth.jwt() ->> 'role', '') = 'service_role');

create policy "Members read site assets"
  on storage.objects
  for select
  using (
    bucket_id = 'site-assets'
    and public.is_site_member_from_path(name)
  );

create policy "Members write site assets"
  on storage.objects
  for insert
  with check (
    bucket_id = 'site-assets'
    and public.is_site_member_from_path(name)
  );

create policy "Members update site assets"
  on storage.objects
  for update
  using (
    bucket_id = 'site-assets'
    and public.is_site_member_from_path(name)
  )
  with check (
    bucket_id = 'site-assets'
    and public.is_site_member_from_path(name)
  );

create policy "Members delete site assets"
  on storage.objects
  for delete
  using (
    bucket_id = 'site-assets'
    and public.is_site_member_from_path(name)
  );
