-- Finance Academy — Phase 2 initial schema
-- Run against your Supabase project via the SQL editor or Supabase CLI

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_emoji text default '🎓',
  created_at timestamptz default now(),
  last_active_at timestamptz default now(),
  total_xp integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_lesson_date date,
  email_weekly_digest boolean default true,
  show_on_leaderboard boolean default false
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- lesson_completions
-- ============================================================
create table public.lesson_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  track_slug text not null,
  lesson_slug text not null,
  completed_at timestamptz default now(),
  quiz_passed boolean default false,
  xp_earned integer default 0,
  unique(user_id, track_slug, lesson_slug)
);

alter table public.lesson_completions enable row level security;

create policy "Users can view own completions"
  on public.lesson_completions for select using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.lesson_completions for insert with check (auth.uid() = user_id);

create index idx_lesson_completions_user on public.lesson_completions(user_id);
create index idx_lesson_completions_track on public.lesson_completions(user_id, track_slug);

-- ============================================================
-- badges
-- ============================================================
create table public.badges (
  slug text primary key,
  name text not null,
  description text not null,
  emoji text not null,
  criteria_type text not null,
  criteria_value text not null,
  display_order integer default 0
);

alter table public.badges enable row level security;

create policy "Badges are viewable by everyone"
  on public.badges for select using (true);

-- ============================================================
-- user_badges
-- ============================================================
create table public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  badge_slug text references public.badges(slug) not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_slug)
);

alter table public.user_badges enable row level security;

create policy "Users can view own badges"
  on public.user_badges for select using (auth.uid() = user_id);

create policy "Anyone can view any user badges"
  on public.user_badges for select using (true);

create policy "Users can insert own badges"
  on public.user_badges for insert with check (auth.uid() = user_id);

-- ============================================================
-- daily_activity
-- ============================================================
create table public.daily_activity (
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_date date not null,
  xp_earned integer default 0,
  lessons_completed integer default 0,
  primary key (user_id, activity_date)
);

alter table public.daily_activity enable row level security;

create policy "Users can view own activity"
  on public.daily_activity for select using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on public.daily_activity for insert with check (auth.uid() = user_id);

create policy "Users can update own activity"
  on public.daily_activity for update using (auth.uid() = user_id);

-- ============================================================
-- calculator_uses (tracks first use per user per calculator)
-- ============================================================
create table public.calculator_uses (
  user_id uuid references public.profiles(id) on delete cascade not null,
  calculator_slug text not null,
  first_used_at timestamptz default now(),
  primary key (user_id, calculator_slug)
);

alter table public.calculator_uses enable row level security;

create policy "Users can view own calculator uses"
  on public.calculator_uses for select using (auth.uid() = user_id);

create policy "Users can insert own calculator uses"
  on public.calculator_uses for insert with check (auth.uid() = user_id);

-- ============================================================
-- trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
