-- Fix infinite recursion in site_members RLS policy
-- The is_site_member function queries site_members, which triggers RLS,
-- which calls is_site_member again, creating infinite recursion.

-- Update is_site_member to bypass RLS when checking membership
create or replace function public.is_site_member(target_site_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result boolean;
begin
  -- Temporarily disable RLS to avoid recursion
  set local row_security = off;
  select exists (
    select 1
    from public.site_members sm
    where sm.site_id = target_site_id
      and sm.user_id = auth.uid()
  ) into result;
  return coalesce(result, false);
end;
$$;

-- Update the policy to allow users to see their own memberships directly
-- and use the fixed is_site_member function for checking other site memberships
drop policy if exists "Members can list memberships" on public.site_members;

create policy "Members can list memberships"
  on public.site_members
  for select
  using (
    user_id = auth.uid()
    or public.is_site_member(site_id)
    or coalesce(auth.jwt() ->> 'role', '') = 'service_role'
  );

