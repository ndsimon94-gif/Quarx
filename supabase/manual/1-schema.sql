-- Quarx schema v1
-- Design notes
--  * Every theory/comment stores its real author_id. "Anonymous" only controls what is SHOWN:
--    the public views below never expose author_id for anonymous posts.
--  * Clients never read the base tables for public content; they read the *_public views,
--    which only return live rows. RLS on base tables limits direct access to your own rows
--    (and to DMZ members for moderation).
--  * Points are computed in the database so they can't be tampered with.

create extension if not exists citext;

-- ---------------------------------------------------------------- reference data
create table public.domains (
  id text primary key,
  name text not null,
  tagline text not null,
  icon text not null,
  hue text not null,
  sort int not null default 0
);

create table public.questions (
  id text primary key,
  domain_id text references public.domains (id),
  title text not null,
  context text,
  origin text not null default 'new' check (origin in ('legacy', 'new', 'community')),
  status text not null default 'live' check (status in ('proposed', 'live', 'retired')),
  qotw_week date,
  time_capsule boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.questions (domain_id);

-- Authors from the original quarxtheories.com (and the "quarx" starter account)
create table public.legacy_authors (
  key text primary key,
  display text not null,
  founder boolean not null default false,
  claimed_by uuid references auth.users (id) on delete set null
);

create table public.voices (
  id text primary key,
  question_id text not null references public.questions (id) on delete cascade,
  author text not null,
  excerpt text not null,
  url text
);

-- ---------------------------------------------------------------- people
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  username citext not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  default_mode text not null default 'username' check (default_mode in ('name', 'username', 'anonymous')),
  appointed_dmz boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- content
create table public.theories (
  id text primary key default ('t' || replace(gen_random_uuid()::text, '-', '')),
  question_id text not null references public.questions (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  legacy_author_key text references public.legacy_authors (key),
  identity_mode text not null default 'username' check (identity_mode in ('name', 'username', 'anonymous')),
  thesis text check (char_length(thesis) <= 200),
  paragraphs text[] not null check (cardinality(paragraphs) > 0),
  change_mind text check (char_length(change_mind) <= 1000),
  -- members' theories go to the DMZ first ("first light"), then everyone
  status text not null default 'dmz_review' check (status in ('dmz_review', 'live', 'voice', 'removed')),
  dmz_pick boolean not null default false,
  starter boolean not null default false,
  needs_review boolean not null default false,
  legacy_url text,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  check (author_id is not null or legacy_author_key is not null)
);
create index on public.theories (question_id, status);
create index on public.theories (author_id);

create table public.ratings (
  theory_id text not null references public.theories (id) on delete cascade,
  rater_id uuid not null references public.profiles (id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  qualities text[] not null default '{}'
    check (qualities <@ array['original', 'reasoned', 'eloquent', 'plausible', 'moving']),
  created_at timestamptz not null default now(),
  primary key (theory_id, rater_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  theory_id text not null references public.theories (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  identity_mode text not null default 'username' check (identity_mode in ('name', 'username', 'anonymous')),
  body text not null check (char_length(body) between 2 and 5000),
  status text not null default 'live' check (status in ('live', 'removed')),
  created_at timestamptz not null default now()
);
create index on public.comments (theory_id);

create table public.saves (
  user_id uuid not null references public.profiles (id) on delete cascade,
  theory_id text not null references public.theories (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, theory_id)
);

-- target is a mind key: a legacy author key, or 'u-<username>' for members
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  target text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, target)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  target text not null,
  message text not null check (char_length(message) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (requester_id, target)
);

create table public.qotw_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 8 and 200),
  created_by uuid references public.profiles (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'chosen', 'declined')),
  created_at timestamptz not null default now()
);

create table public.qotw_votes (
  suggestion_id uuid not null references public.qotw_suggestions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (suggestion_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  theory_id text references public.theories (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 1000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- points & DMZ
create or replace view public.profile_points
with (security_invoker = false) as
select
  p.id as user_id,
  (select count(*) from public.theories t where t.author_id = p.id and t.status = 'live') * 5
  + (select count(*) from public.comments c where c.author_id = p.id and c.status = 'live') * 1
  + (select count(*) from public.ratings r join public.theories t on t.id = r.theory_id
       where t.author_id = p.id and r.rater_id <> p.id and r.stars >= 4) * 2
  as points
from public.profiles p;

create or replace function public.is_dmz(uid uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select p.appointed_dmz or coalesce(pp.points, 0) >= 100
       from public.profiles p left join public.profile_points pp on pp.user_id = p.id
      where p.id = uid),
    false);
$$;

-- ---------------------------------------------------------------- public views
-- What a reader may see about an author, honouring anonymity.
create or replace view public.theories_public
with (security_invoker = false) as
select
  t.id, t.question_id, t.thesis, t.paragraphs, t.change_mind, t.status,
  t.dmz_pick, t.starter, t.needs_review, t.legacy_url,
  coalesce(t.published_at, t.created_at) as published_at,
  t.identity_mode,
  case
    when t.identity_mode = 'anonymous' then 'Anonymous'
    when t.legacy_author_key is not null then la.display
    when t.identity_mode = 'name' then p.display_name
    else '@' || p.username::text
  end as author_display,
  case
    when t.identity_mode = 'anonymous' then null
    when t.legacy_author_key is not null then t.legacy_author_key
    else 'u-' || p.username::text
  end as author_key,
  coalesce(la.founder, false) as author_founder,
  (select count(*) from public.ratings r where r.theory_id = t.id) as rating_count,
  (select round(avg(r.stars)::numeric, 2) from public.ratings r where r.theory_id = t.id) as rating_avg,
  (select count(*) from public.comments c where c.theory_id = t.id and c.status = 'live') as comment_count
from public.theories t
left join public.legacy_authors la on la.key = t.legacy_author_key
left join public.profiles p on p.id = t.author_id
where t.status = 'live'
   or (t.status = 'dmz_review' and public.is_dmz());

create or replace view public.comments_public
with (security_invoker = false) as
select
  c.id, c.theory_id, c.body, c.created_at, c.identity_mode,
  case when c.identity_mode = 'anonymous' then 'Anonymous'
       when c.identity_mode = 'name' then p.display_name
       else '@' || p.username::text end as author_display,
  case when c.identity_mode = 'anonymous' then null else 'u-' || p.username::text end as author_key,
  (c.author_id = auth.uid()) as is_mine
from public.comments c
join public.profiles p on p.id = c.author_id
where c.status = 'live';

create or replace view public.qotw_suggestions_public
with (security_invoker = false) as
select s.id, s.title, s.created_at, s.status,
  (select count(*) from public.qotw_votes v where v.suggestion_id = s.id) as votes,
  exists (select 1 from public.qotw_votes v where v.suggestion_id = s.id and v.user_id = auth.uid()) as voted
from public.qotw_suggestions s
where s.status = 'open';

-- ---------------------------------------------------------------- guards
-- New members' theories start in DMZ review; DMZ members publish directly.
create or replace function public.theories_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then
    new.author_id := auth.uid();
    new.legacy_author_key := null;
    new.dmz_pick := false;
    new.starter := false;
    new.needs_review := false;
    new.legacy_url := null;
    new.status := case when public.is_dmz(auth.uid()) then 'live' else 'dmz_review' end;
    new.published_at := case when new.status = 'live' then now() end;
  end if;
  return new;
end $$;
create trigger theories_before_insert before insert on public.theories
for each row execute function public.theories_before_insert();

-- You can't rate your own theory.
create or replace function public.ratings_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.theories t where t.id = new.theory_id and t.author_id = new.rater_id) then
    raise exception 'You cannot rate your own theory';
  end if;
  return new;
end $$;
create trigger ratings_guard before insert or update on public.ratings
for each row execute function public.ratings_guard();

-- Create a profile when someone signs up (name + username passed as sign-up metadata).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));
  uname text;
begin
  base := left(case when char_length(base) < 3 then 'mind' || base else base end, 20);
  uname := base;
  while exists (select 1 from public.profiles where username = uname) loop
    uname := base || floor(random() * 9000 + 1000)::int;
  end loop;
  insert into public.profiles (id, display_name, username, default_mode)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), initcap(base)),
    uname,
    coalesce(nullif(new.raw_user_meta_data ->> 'default_mode', ''), 'username')
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- DMZ moderation: publish / move to voices / remove a theory.
create or replace function public.dmz_decide(p_theory_id text, p_decision text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_dmz() then raise exception 'Only the DMZ can review theories'; end if;
  if p_decision not in ('live', 'voice', 'removed') then raise exception 'Unknown decision'; end if;
  update public.theories
     set status = p_decision,
         needs_review = false,
         published_at = case when p_decision = 'live' then coalesce(published_at, now()) else published_at end
   where id = p_theory_id;
  -- Published work moved to Voices becomes a short excerpt that credits its author.
  if p_decision = 'voice' then
    insert into public.voices (id, question_id, author, excerpt, url)
    select 'v-' || t.id, t.question_id, coalesce(la.display, 'Unknown'),
           array_to_string((regexp_split_to_array(array_to_string(t.paragraphs, ' '), '\s+'))[1:48], ' ') || '…',
           t.legacy_url
      from public.theories t left join public.legacy_authors la on la.key = t.legacy_author_key
     where t.id = p_theory_id
    on conflict (id) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------- row-level security
alter table public.domains enable row level security;
alter table public.questions enable row level security;
alter table public.legacy_authors enable row level security;
alter table public.voices enable row level security;
alter table public.profiles enable row level security;
alter table public.theories enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.connections enable row level security;
alter table public.qotw_suggestions enable row level security;
alter table public.qotw_votes enable row level security;
alter table public.reports enable row level security;

-- reference data: everyone reads
create policy "read domains" on public.domains for select using (true);
create policy "read live questions" on public.questions for select using (status = 'live' or public.is_dmz());
create policy "propose questions" on public.questions for insert to authenticated
  with check (status = 'proposed' and origin = 'community' and created_by = auth.uid());
create policy "read legacy authors" on public.legacy_authors for select using (true);
create policy "read voices" on public.voices for select using (true);

-- profiles: public fields are readable; you edit your own
create policy "read profiles" on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and appointed_dmz = (select appointed_dmz from public.profiles where id = auth.uid()));

-- theories: base table only for your own rows (+ DMZ); everyone else uses theories_public
create policy "read own theories" on public.theories for select to authenticated
  using (author_id = auth.uid() or public.is_dmz());
create policy "post theories" on public.theories for insert to authenticated with check (author_id = auth.uid());
create policy "edit own theories" on public.theories for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "delete own theories" on public.theories for delete to authenticated using (author_id = auth.uid());

-- ratings: your own only (aggregates come from theories_public)
create policy "read own ratings" on public.ratings for select to authenticated using (rater_id = auth.uid());
create policy "rate" on public.ratings for insert to authenticated with check (rater_id = auth.uid());
create policy "re-rate" on public.ratings for update to authenticated using (rater_id = auth.uid()) with check (rater_id = auth.uid());
create policy "unrate" on public.ratings for delete to authenticated using (rater_id = auth.uid());

-- comments
create policy "read own comments" on public.comments for select to authenticated using (author_id = auth.uid() or public.is_dmz());
create policy "comment" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "edit own comments" on public.comments for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "delete own comments" on public.comments for delete to authenticated using (author_id = auth.uid());

-- personal lists
create policy "own saves" on public.saves for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own follows" on public.follows for all to authenticated using (follower_id = auth.uid()) with check (follower_id = auth.uid());
create policy "own connection requests" on public.connections for all to authenticated
  using (requester_id = auth.uid()) with check (requester_id = auth.uid());

-- question of the week
create policy "read suggestions" on public.qotw_suggestions for select using (true);
create policy "suggest" on public.qotw_suggestions for insert to authenticated with check (created_by = auth.uid());
create policy "own votes" on public.qotw_votes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reports
create policy "report" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "dmz reads reports" on public.reports for select to authenticated using (public.is_dmz());

-- views are the public read surface
grant select on public.theories_public, public.comments_public, public.qotw_suggestions_public, public.profile_points
  to anon, authenticated;
grant execute on function public.is_dmz(uuid), public.dmz_decide(text, text) to authenticated;
