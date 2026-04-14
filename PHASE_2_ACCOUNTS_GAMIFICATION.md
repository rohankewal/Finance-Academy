# PROJECT: Finance Academy — Phase 2: Accounts & Gamification

## Mission

Add user accounts and gamification to Finance Academy so users have a reason to return daily and progress isn't lost across devices. This phase prepares the platform for a marketing push by ensuring retention mechanics are in place *before* traffic arrives.

**Core principle:** Accounts are optional, never required. Anyone should be able to use the entire site without signing up. Signing up unlocks cross-device progress, streaks, XP, badges, and certificates — never gates core content.

---

## Tech Stack Additions

Add these to the existing stack. Do not replace anything already in place.

- **Auth + Database:** Supabase (free tier is plenty for initial launch)
  - Use the `@supabase/supabase-js` client SDK
  - Use the `@supabase/ssr` package for SvelteKit server-side auth
- **Email (magic links):** Supabase's built-in email auth (no separate provider needed for MVP)
- **Environment variables:** use SvelteKit's `$env/static/public` and `$env/static/private`
- **Date handling:** use `date-fns` (small, tree-shakeable)
- **Confetti / micro-animations for achievements:** `canvas-confetti` (lightweight, no deps)

Do NOT add: Firebase, Auth0, Clerk, NextAuth, Prisma, or any heavier ORM. Supabase's generated types are enough.

---

## Environment Variables (document in README and .env.example)

```
PUBLIC_SUPABASE_URL=https://<project>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, never exposed
PUBLIC_SITE_URL=https://finance-academy-chi.vercel.app
```

---

## Database Schema (Supabase / PostgreSQL)

Create these tables exactly. Provide migration SQL in `/supabase/migrations/001_initial_schema.sql`.

### `profiles`
Extends Supabase's `auth.users` table. One-to-one with auth users.

```sql
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
  email_weekly_digest boolean default true
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
```

### `lesson_completions`
Tracks which lessons each user has completed.

```sql
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
```

### `badges`
Catalog of earnable badges. Seeded from code, not user-editable.

```sql
create table public.badges (
  slug text primary key,
  name text not null,
  description text not null,
  emoji text not null,
  criteria_type text not null,  -- 'lessons_completed', 'track_completed', 'streak', 'all_calculators', 'xp_threshold'
  criteria_value text not null, -- JSON-encoded requirement
  display_order integer default 0
);

alter table public.badges enable row level security;

create policy "Badges are viewable by everyone"
  on public.badges for select using (true);
```

### `user_badges`
Which badges each user has earned.

```sql
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

create policy "Anyone can view any user's badges by user id"
  on public.user_badges for select using (true);

create policy "Users can insert own badges"
  on public.user_badges for insert with check (auth.uid() = user_id);
```

### `daily_activity`
Tracks daily streak activity.

```sql
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
```

### Database trigger: auto-create profile on signup

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## XP System (exact values)

Define in `/src/lib/gamification/xp.ts`:

| Action | XP |
|---|---|
| Complete a lesson (first time) | 50 |
| Pass the lesson's QuickQuiz on first try | +25 (total 75) |
| Pass on second+ try | +10 (total 60) |
| Complete entire track | +100 bonus |
| Use a calculator for the first time | 15 |
| Daily login (any action counts) | 10 |
| 7-day streak milestone | +50 bonus |
| 30-day streak milestone | +200 bonus |
| 100-day streak milestone | +500 bonus |

Re-completing a lesson awards 0 XP. XP is earned-forever, never decays.

---

## Levels

Users level up based on cumulative XP. Define in `/src/lib/gamification/levels.ts`:

```typescript
export const LEVELS = [
  { level: 1, name: 'Beginner',        minXp: 0 },
  { level: 2, name: 'Learner',         minXp: 100 },
  { level: 3, name: 'Student',         minXp: 300 },
  { level: 4, name: 'Scholar',         minXp: 600 },
  { level: 5, name: 'Strategist',      minXp: 1000 },
  { level: 6, name: 'Planner',         minXp: 1500 },
  { level: 7, name: 'Investor',        minXp: 2200 },
  { level: 8, name: 'Analyst',         minXp: 3000 },
  { level: 9, name: 'Expert',          minXp: 4000 },
  { level: 10, name: 'Finance Master', minXp: 5500 }
];
```

Provide helper functions: `getLevelForXp(xp)`, `getNextLevel(xp)`, `getProgressToNextLevel(xp)` (returns 0-1).

---

## Badges (seed these on first DB setup)

Seed via `/supabase/seed.sql` or a one-time script. Store in the `badges` table.

| Slug | Name | Emoji | Description | Criteria |
|---|---|---|---|---|
| `first-lesson` | First Step | 🌱 | Complete your first lesson | `lessons_completed: 1` |
| `five-lessons` | Getting Started | 📚 | Complete 5 lessons | `lessons_completed: 5` |
| `ten-lessons` | Committed | 🎯 | Complete 10 lessons | `lessons_completed: 10` |
| `all-lessons` | Finance Academy Graduate | 🎓 | Complete every lesson | `lessons_completed: <total-count>` |
| `money-basics-complete` | Money Mastered | 💰 | Finish the Money Basics track | `track_completed: money-basics` |
| `debt-101-complete` | Debt Destroyer | ⛓️‍💥 | Finish the Debt 101 track | `track_completed: debt-101` |
| `investing-complete` | Future Millionaire | 📈 | Finish Investing Fundamentals | `track_completed: investing-fundamentals` |
| `calculator-curious` | Number Cruncher | 🧮 | Use all 5 calculators | `all_calculators: true` |
| `week-streak` | On Fire | 🔥 | 7-day streak | `streak: 7` |
| `month-streak` | Unstoppable | 🚀 | 30-day streak | `streak: 30` |
| `hundred-streak` | Legendary | 👑 | 100-day streak | `streak: 100` |
| `quick-learner` | Quick Learner | ⚡ | Pass 5 quizzes on first try | `quiz_streak: 5` |
| `first-thousand` | First Thousand | 💵 | Earn 1000 XP | `xp_threshold: 1000` |

---

## Streaks Logic

Implement in `/src/lib/gamification/streaks.ts`:

**Rules:**
- A "streak day" = any day the user completed at least one lesson OR used a calculator
- Streak increments when today's activity is on consecutive calendar days (user's local timezone, but store UTC dates and convert)
- If user misses a day, streak resets to 1 the next time they're active (not 0 — doing something counts as day 1 again)
- Longest streak is tracked separately and never decreases

**Implementation:**

```typescript
export async function updateStreak(userId: string, supabase: SupabaseClient) {
  // 1. Get profile's last_lesson_date and current_streak
  // 2. Get today's date in user's local timezone (for MVP, assume UTC)
  // 3. If last_lesson_date === today: no change (already counted today)
  // 4. If last_lesson_date === yesterday: increment current_streak by 1
  // 5. Else: reset current_streak to 1
  // 6. Update longest_streak if current_streak exceeds it
  // 7. Update last_lesson_date to today
  // 8. Return { currentStreak, longestStreak, didIncrease: boolean }
}
```

Show a streak flame icon in the top nav with the current number. On streak milestones (7, 30, 100), trigger a confetti animation and award the badge.

---

## Auth Flow (magic link, no passwords)

Use Supabase magic link email auth. Zero password management.

**Flow:**

1. User clicks "Sign up" or "Sign in" button (same UI, Supabase handles both)
2. Modal/page prompts for email only
3. User enters email → Supabase sends magic link
4. User clicks link → redirects to `/auth/callback` → SvelteKit exchanges code for session → redirects to `/dashboard`
5. First-time users see a 3-step onboarding: pick display name → pick avatar emoji → see dashboard

**Required routes:**
- `/auth/signin` — email input form
- `/auth/callback` — handles magic link redirect, exchanges code, sets cookie
- `/auth/signout` — clears session, redirects home
- `/onboarding` — shown once after first signup

**Required server-side handlers:**

Use `@supabase/ssr` pattern. Create `/src/hooks.server.ts` that:
1. Creates a server-side Supabase client per request using cookies
2. Populates `event.locals.supabase` and `event.locals.session`
3. Protects routes under `/dashboard` and `/settings` (redirect to `/auth/signin` if unauthenticated)

Provide `/src/lib/supabase/client.ts` (browser client) and `/src/lib/supabase/server.ts` (server client factory).

---

## Progress Migration (localStorage → database on signup)

Critical for UX: if someone has been using the site anonymously (localStorage progress) and then signs up, their existing progress must migrate automatically.

**Implementation:**

1. On successful auth callback, check if the new user has any existing `lesson_completions` in the database
2. If zero: read localStorage progress, bulk-insert into `lesson_completions` with completion timestamps
3. If any exist: merge — any localStorage completion not already in DB gets inserted
4. After migration, clear the localStorage progress key
5. Recalculate total_xp based on migrated completions (50 XP base per completion — assume no quiz data existed pre-migration, so no quiz bonus retroactively)

Place this in `/src/lib/gamification/migrate.ts` and call it from `/src/routes/auth/callback/+server.ts` after the code exchange.

---

## Components to Build

### Layout additions

**`/src/lib/components/layout/UserMenu.svelte`**
- Shown in TopNav when logged in
- Avatar emoji + level badge
- Dropdown with: Dashboard, Badges, Settings, Sign out
- When logged out: show "Sign in" button

**`/src/lib/components/layout/StreakIndicator.svelte`**
- Small 🔥 + number in TopNav
- Only visible when logged in AND current_streak > 0
- Click → goes to dashboard
- Tooltip on hover: "You're on a 12-day streak. Don't break it!"

**`/src/lib/components/layout/XpBar.svelte`**
- Thin progress bar showing XP progress to next level
- Show in TopNav on desktop, in UserMenu dropdown on mobile

### Auth components

**`/src/lib/components/auth/SignInForm.svelte`**
- Email input + "Send magic link" button
- Post-submit state: "Check your email for a sign-in link"
- Loading + error states

**`/src/lib/components/auth/OnboardingFlow.svelte`**
- Three steps with progress dots
- Step 1: "What should we call you?" (display name)
- Step 2: "Pick your avatar" (grid of 24 emoji choices)
- Step 3: "You're all set!" (summary, "Start learning" CTA)

### Gamification components

**`/src/lib/components/gamification/XpToast.svelte`**
- Small toast that appears bottom-right when user earns XP
- Shows "+50 XP — Lesson complete!" with sparkle animation
- Auto-dismisses after 3 seconds
- Stackable if multiple earned in quick succession

**`/src/lib/components/gamification/BadgeUnlockModal.svelte`**
- Full modal that appears when a badge is earned
- Large emoji + badge name + description
- Confetti animation on open (canvas-confetti)
- "Awesome!" button to dismiss
- "Share" button to copy a pre-filled message to clipboard

**`/src/lib/components/gamification/StreakCelebration.svelte`**
- Appears on streak milestones (7, 30, 100)
- Larger, more celebratory than badge modal
- Different messaging per milestone

**`/src/lib/components/gamification/LevelUpModal.svelte`**
- Appears when user crosses an XP threshold
- Shows "Level 3: Student" unlocked
- Confetti

### Dashboard components

**`/src/lib/components/dashboard/ProgressOverview.svelte`**
- Total XP, current level + progress bar, current streak, longest streak
- Lessons completed / total

**`/src/lib/components/dashboard/TrackProgress.svelte`**
- One card per track showing: lessons completed / total, percentage, "Continue" button that resumes the next uncompleted lesson

**`/src/lib/components/dashboard/ActivityHeatmap.svelte`**
- GitHub-style heatmap of last 90 days
- Each square = one day, color intensity = XP earned that day
- Hover shows exact XP

**`/src/lib/components/dashboard/BadgeShelf.svelte`**
- Grid of earned badges + grayed-out locked ones
- Click any badge → shows description and how to earn (if locked)

**`/src/lib/components/dashboard/NextUpCard.svelte`**
- Suggests the next lesson based on in-progress tracks
- If no tracks started, suggests starting Money Basics

---

## New Routes

### `/dashboard` (authenticated)

User's home base. Sections in this order:
1. Greeting: "Good morning, [name] 👋" (contextual greeting by time of day)
2. `<ProgressOverview />`
3. `<NextUpCard />`
4. `<TrackProgress />` for all tracks
5. `<ActivityHeatmap />`
6. `<BadgeShelf />` (earned + next 3 to earn)

### `/profile/[username]` (public)

Shareable public profile. Shows:
- Display name, avatar, join date
- Level + total XP
- Current streak
- Badges earned (all visible)
- Tracks completed
- "This is [username]'s Finance Academy progress" — designed to be shareable

Purpose: makes XP/badges a social signal. Users can share their profile on social media — free marketing.

### `/badges` (public)

Catalog of all available badges with criteria. Logged-in users see which they've earned vs locked.

### `/leaderboard` (optional for MVP — add if time permits)
- Top 50 users by total XP (last 30 days)
- Only show users who've opted in (add `show_on_leaderboard` boolean to profiles)

### `/settings` (authenticated)
- Change display name
- Change avatar emoji
- Toggle weekly email digest
- Toggle `show_on_leaderboard`
- Delete account button (with confirmation)

### `/certificate/[track-slug]` (authenticated)
- Shareable certificate page for completed tracks
- Clean, printable design
- User's display name + completion date
- Track name + lesson count
- "Share on LinkedIn" button — pre-filled with track name and certificate URL

---

## API Routes / Server Actions

Use SvelteKit form actions or `+server.ts` endpoints. All write operations must verify the session.

**`POST /api/lessons/complete`**
- Body: `{ trackSlug, lessonSlug, quizPassed, quizAttempts }`
- Server logic:
  1. Verify session
  2. Check if already completed (return early if so)
  3. Calculate XP: 50 base + 25 if passed on first try + 10 if passed on second try
  4. Insert `lesson_completions` row
  5. Update `daily_activity` (upsert)
  6. Update profile's `total_xp`, `last_active_at`
  7. Run streak update logic → may award streak badges
  8. Check for new badge unlocks → insert `user_badges` rows for any new ones
  9. Check if track is now 100% complete → award track-complete badge + 100 XP bonus
  10. Return `{ xpEarned, newBadges: [], streakUpdated, levelUp: boolean }`

**`POST /api/calculators/use`**
- Body: `{ calculatorSlug }`
- Logic: track first use per user, award 15 XP + check for "Calculator Curious" badge

**`GET /api/profile/me`**
- Returns full profile + completions + badges for current user

---

## Existing Pages — Modifications Required

### `/learn/[track]/[lesson]/+page.svelte`
- When user completes lesson (clicks "Mark Complete" or passes quiz):
  - If logged in: POST to `/api/lessons/complete`, handle response, show XP toast, show badge modal if applicable
  - If logged out: use existing localStorage flow AND show a small banner: "Sign up to save your progress across devices"
- After completion, update the UI to show XP earned and any unlocked badges

### `/calculators/[name]/+page.svelte`
- Track first use (fire off `POST /api/calculators/use` once per session per calculator)
- Show XP toast if first use ever

### Homepage `/+page.svelte`
- Add a logged-in variant of the hero: "Welcome back, [name]. You're on a 12-day streak 🔥. Continue learning →"
- Add social proof section (only after signup is live and has some data): "Join 500+ learners" — conditional render, hide if count < 100

### TopNav
- Add StreakIndicator, XpBar (desktop), UserMenu
- When logged out: add "Sign up" CTA button next to existing links

---

## Email: Weekly Digest (optional for this phase — build if time)

Using Supabase Edge Functions + Resend (or skip entirely for MVP). Weekly email to users with `email_weekly_digest = true`:
- Their week's XP
- Current streak status
- "You're 3 lessons away from the Debt Destroyer badge"
- One suggested lesson

If building this adds >4 hours, **skip it** for this phase and file as follow-up work.

---

## Visual / UX Requirements

- Match existing design system (emerald/amber color scheme, Inter/JetBrains Mono fonts)
- XP numbers always use JetBrains Mono
- Badges use bright, saturated colors for earned state and grayscale for locked
- All celebration moments (XP toast, badge modal, level up) should feel fun but not intrusive — no auto-playing sound, no full-screen blockers longer than 3 seconds without user dismissal
- Respect `prefers-reduced-motion` — skip confetti and transform animations if set
- Dashboard should feel motivating, not overwhelming. Whitespace. Clear hierarchy.

---

## Anti-Patterns to Avoid

- **Don't gate lessons behind signup.** Ever. Users should be able to complete the entire curriculum logged out.
- **Don't send more than one email per week.** No daily nag emails.
- **Don't show "Log in to see this" placeholders on dashboard sections.** If logged out, hide the dashboard entirely and redirect to sign-in.
- **Don't let XP earning feel grindy.** No "+2 XP for scrolling" nonsense. XP comes from actual learning actions only.
- **Don't require real names.** Username + display name, both optional.
- **Don't over-animate.** Celebration moments are sparing and meaningful.
- **Don't make the leaderboard mandatory.** It's opt-in or skipped entirely for now.

---

## Acceptance Criteria (build is done when ALL are true)

- [ ] User can sign up via email magic link
- [ ] User can sign in and sign out
- [ ] New users go through 3-step onboarding once
- [ ] Lesson completion awards correct XP, updates DB, shows toast
- [ ] Quiz-first-try detection works — correct bonus XP
- [ ] Streaks increment on consecutive-day activity, reset on gap, persist longest
- [ ] All 13 seeded badges exist in DB and unlock correctly when criteria met
- [ ] Badge unlock shows modal with confetti
- [ ] Level-up shows modal when XP threshold crossed
- [ ] Dashboard shows accurate progress, streak, XP, heatmap, badges
- [ ] Public profile page works at `/profile/[username]`
- [ ] Certificate page works for any completed track
- [ ] LocalStorage progress migrates to DB on first sign-in
- [ ] Logged-out users can still use the entire site — nothing is gated
- [ ] Banner prompts logged-out users to sign up, but never blocks
- [ ] All routes protected correctly (dashboard/settings require auth)
- [ ] `prefers-reduced-motion` is respected
- [ ] Mobile responsive (375/768/1280)
- [ ] No TypeScript or console errors
- [ ] `npm run build` succeeds
- [ ] Supabase migrations run cleanly on a fresh project

---

## Build Order

1. Set up Supabase project, get credentials, add env vars
2. Run migration SQL to create all tables + RLS policies
3. Seed badges table
4. Add Supabase client libs (`/src/lib/supabase/client.ts`, `/src/lib/supabase/server.ts`)
5. Build `/src/hooks.server.ts` for session management
6. Build auth routes (`/auth/signin`, `/auth/callback`, `/auth/signout`)
7. Build onboarding flow
8. Build gamification core logic (XP, levels, streaks, badge-checking)
9. Build API endpoints (`/api/lessons/complete`, `/api/calculators/use`)
10. Modify existing lesson + calculator pages to hit new endpoints when logged in
11. Build all gamification components (toasts, modals)
12. Build UserMenu, StreakIndicator, XpBar in TopNav
13. Build dashboard route + all its components
14. Build public profile route
15. Build badges catalog route
16. Build settings route
17. Build certificate route
18. Implement localStorage → DB migration on first sign-in
19. Mobile responsive pass
20. Reduced motion + accessibility pass
21. End-to-end test the full flow: signup → onboarding → complete lesson → earn XP → earn badge → level up → dashboard reflects everything → sign out → sign back in → state persists

---

## What NOT to Do

- Don't build a full social network (no friends, no following, no comments)
- Don't build email beyond magic links (skip weekly digest if it adds scope)
- Don't build an admin panel (use Supabase Studio for manual ops)
- Don't add password auth (magic links only for MVP)
- Don't add OAuth providers (Google/GitHub login) — magic link is enough
- Don't build a mobile app (web-first, responsive)
- Don't add in-app notifications beyond the XP/badge toasts
- Don't add premium tiers, paywalls, or anything that charges money
- Don't track analytics beyond what's already in place (that's a separate phase)

---

## Reference Documents

Before coding, Claude Code should read:
- `PROJECT_SPEC.md` (original MVP spec — for existing conventions)
- `LESSON_AUTHORING.md` (for understanding lesson structure)
- `AUTOPILOT.md` (for understanding the autopilot workflow)

This phase must not break any existing functionality. The site must continue to work exactly as it does now for logged-out users.

---

## Deployment Notes

- Add all Supabase env vars to Vercel project settings before deploying
- Run migrations against production Supabase project (manually or via Supabase CLI) before first deploy of this phase
- Seed the `badges` table in production DB after migration
- Test the full magic link flow on the production domain (email deliverability differs from localhost)

Ask clarifying questions ONLY if something in this spec contradicts itself. Otherwise, proceed and deliver a working, deployable Phase 2.