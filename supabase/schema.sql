-- Run once in the Supabase SQL editor (Dashboard -> SQL -> New query).
-- Every table has row level security enabled and no policies, so only the
-- server-side secret key (never shipped to the browser) can read or write.

create extension if not exists pgcrypto;

-- Contact form submissions
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 5000),
  ip_hash text,
  read boolean not null default false
);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_ip_hash_idx on public.contact_messages (ip_hash, created_at);

-- Anonymous page views (no cookies, no raw IP addresses)
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  referrer_host text,
  country text,
  region text,
  city text,
  device text,
  browser text,
  visitor_hash text not null
);
create index if not exists page_views_created_at_idx on public.page_views (created_at);

-- Uploaded resume files; the newest row is the one shown on /resume
create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null unique,
  size_bytes integer,
  original_name text
);

-- Failed admin logins, used to lock out brute-force attempts
create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ip_hash text not null
);
create index if not exists admin_login_attempts_idx on public.admin_login_attempts (ip_hash, created_at);

alter table public.contact_messages enable row level security;
alter table public.page_views enable row level security;
alter table public.resume_versions enable row level security;
alter table public.admin_login_attempts enable row level security;

-- Public storage bucket for the resume PDF (max 4 MB, PDF only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resume', 'resume', true, 4194304, array['application/pdf'])
on conflict (id) do nothing;

-- Total visits: unique visitors per day, summed over all days
create or replace function public.total_visits()
returns bigint
language sql stable
set search_path = public
as $$
  select count(distinct (created_at::date)::text || ':' || visitor_hash) from public.page_views;
$$;

-- Dashboard summary for the last `range_days` days
create or replace function public.analytics_summary(range_days integer default 30)
returns json
language sql stable
set search_path = public
as $$
  with v as (
    select * from public.page_views
    where created_at >= (now()::date - (range_days - 1))
  )
  select json_build_object(
    'views', (select count(*) from v),
    'visitors', (select count(distinct (created_at::date)::text || ':' || visitor_hash) from v),
    'all_time_views', (select count(*) from public.page_views),
    'all_time_visits', (select public.total_visits()),
    'by_day', coalesce((
      select json_agg(d order by d.day) from (
        select g::date as day, count(v.id) as views, count(distinct v.visitor_hash) as visitors
        from generate_series(now()::date - (range_days - 1), now()::date, interval '1 day') g
        left join v on v.created_at::date = g::date
        group by 1
      ) d
    ), '[]'::json),
    'pages', coalesce((select json_agg(t) from (
      select path as label, count(*) as count from v group by 1 order by 2 desc limit 15) t), '[]'::json),
    'countries', coalesce((select json_agg(t) from (
      select coalesce(country, 'Unknown') as label, count(*) as count from v group by 1 order by 2 desc limit 15) t), '[]'::json),
    'cities', coalesce((select json_agg(t) from (
      select concat_ws(', ', city, region, country) as label, count(*) as count
      from v where city is not null group by 1 order by 2 desc limit 15) t), '[]'::json),
    'referrers', coalesce((select json_agg(t) from (
      select coalesce(referrer_host, 'Direct / none') as label, count(*) as count from v group by 1 order by 2 desc limit 15) t), '[]'::json),
    'devices', coalesce((select json_agg(t) from (
      select coalesce(device, 'Unknown') as label, count(*) as count from v group by 1 order by 2 desc) t), '[]'::json),
    'browsers', coalesce((select json_agg(t) from (
      select coalesce(browser, 'Other') as label, count(*) as count from v group by 1 order by 2 desc) t), '[]'::json)
  );
$$;

revoke execute on function public.total_visits() from public, anon, authenticated;
revoke execute on function public.analytics_summary(integer) from public, anon, authenticated;
grant execute on function public.total_visits() to service_role;
grant execute on function public.analytics_summary(integer) to service_role;
