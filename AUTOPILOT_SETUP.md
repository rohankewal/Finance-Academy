# Finance Academy — Autopilot Setup Guide

This is the Level 4 automation system: scheduled Claude runs that open pull requests for your review. You review and merge. Nothing goes live without your approval.

---

## What's Included

| File | Destination in your repo | Purpose |
|---|---|---|
| `AUTOPILOT.md` | Repo root | Master orchestrator prompt — Claude reads this to route any content task |
| `BACKLOG.md` | Repo root | Work queue — add bullet points, autopilot pulls from the top weekly |
| `.github/workflows/weekly-content.yml` | `.github/workflows/` | Monday 9am UTC: pull from backlog, write lesson, open PR |
| `.github/workflows/monthly-audit.yml` | `.github/workflows/` | 1st of month 9am UTC: audit, rewrite bottom 3 lessons, open PR |
| `.github/workflows/on-demand.yml` | `.github/workflows/` | Manual trigger from GitHub UI or `/autopilot` comment on an issue |

This assumes you already have the Level 1 pieces in place:
- `LESSON_AUTHORING.md` in repo root
- `scripts/new-lesson.ts`, `validate-lessons.ts`, `audit-lessons.ts`, `plan-track.ts` in `scripts/`
- npm scripts wired into `package.json`
- The SvelteKit project itself

---

## One-Time Setup

### 1. Copy files into your repo

Drop `AUTOPILOT.md` and `BACKLOG.md` in the repo root. Drop the three `.yml` files into `.github/workflows/`.

### 2. Add your Anthropic API key as a GitHub secret

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. In your GitHub repo: Settings → Secrets and variables → Actions → New repository secret
3. Name: `ANTHROPIC_API_KEY`
4. Value: your key

### 3. Enable the Claude Code GitHub Action

The workflows use `anthropics/claude-code-action@v1`. Claude Code's official GitHub integration has an install step — follow the instructions at Anthropic's docs site. Short version: install the Claude GitHub App into your repo, grant it the permissions the workflows request, and you're done.

Worth searching Anthropic's docs for the latest setup instructions since this part evolves.

### 4. Configure branch protection on `main`

This is critical. You want to guarantee autopilot PRs can't merge themselves.

Repo Settings → Branches → Branch protection rules → Add rule for `main`:
- ✓ Require a pull request before merging
- ✓ Require approvals (at least 1 — that approval is *you*)
- ✓ Dismiss stale approvals when new commits are pushed
- ✓ Require status checks to pass (add `lessons:validate` as required once CI is set up)
- ✗ Do NOT check "Allow administrators to bypass" — this is the safety net

With this in place, even if autopilot has a bug and tries to push to main, it can't.

### 5. Test the on-demand workflow first

Before trusting the scheduled jobs, trigger a manual run:

1. Go to Actions tab in your repo
2. Click "On-Demand Autopilot" in the left sidebar
3. Click "Run workflow"
4. Paste a simple test request, e.g.: *"add a lesson on compound interest to investing-fundamentals, order 2"*
5. Click Run

Watch the logs. Claude should scaffold, write, validate, and open a PR. Review the PR. If it looks good, you know the system works.

### 6. Turn on scheduled workflows

Scheduled workflows (cron) are enabled by default once the file is in `.github/workflows/`. But GitHub auto-disables schedules if there's no repo activity for 60 days — something to know. A monthly audit run counts as activity, so you're fine as long as the whole system is running.

---

## Daily/Weekly Usage

### Your ongoing routine

**Monday morning** (~5 minutes/week):
- Open GitHub → Pull Requests
- Find a PR from `finance-academy-autopilot` with a new lesson
- Review: accuracy, tone, examples
- Either merge, request changes (Claude can respond to review comments if you tag it), or close with feedback
- That's it

**First of the month** (~10 minutes/month):
- Review the audit PR with rewritten lessons
- Compare before/after audit scores in the PR body
- Merge if the rewrites are improvements

**Whenever you have a lesson idea:**
- Add a bullet to `BACKLOG.md` in the correct format
- The autopilot will pick it up on the next Monday run

**For a new track:**
- Don't use the backlog. Instead, either:
  - Actions tab → On-Demand Autopilot → *"create an Insurance Basics track with 6 lessons"*
  - OR create a GitHub issue and comment `/autopilot create an Insurance Basics track with 6 lessons`
- This triggers Workflow B, which is two-phase: first a curriculum-proposal PR (you approve), then a write PR (you review and merge)

### From your phone

The `/autopilot` issue comment trigger is specifically for mobile. You can:
1. Open the GitHub mobile app
2. Create an issue titled anything (e.g., "lesson request")
3. Comment `/autopilot add a lesson on how credit scores affect mortgage rates to debt-101`
4. Walk away. When you check back, there will be a PR.

---

## How the Safety Model Works

Three layers prevent autopilot mistakes from reaching users:

**Layer 1 — `AUTOPILOT.md` Stop Conditions.** Hard-coded rules that make Claude halt instead of guess. Unclear request? Stop. Validation fails 3 times? Stop. Would touch >15 files? Stop. A stopped autopilot opens a draft PR with `[NEEDS HUMAN]` instead of forcing through.

**Layer 2 — Validator + Auditor scripts.** Every lesson Claude writes must pass `lessons:validate` before the PR opens. If drift appears later, `lessons:audit` flags it next month.

**Layer 3 — You, the human reviewer.** Branch protection on `main` means no autopilot commit reaches production without your explicit approval click. This is the real safety net.

The failure mode you're preventing: a subtly wrong fact about Roth IRA limits or tax brackets gets written, shipped, and misleads a teenager. Layers 1 and 2 catch most of this. Layer 3 catches the rest.

---

## Cost Management

Rough token budget per workflow run:

- **Weekly backlog pull:** ~30–60k tokens (reading LESSON_AUTHORING + AUTOPILOT + writing one lesson + validation loop). At current Sonnet pricing, a few dollars.
- **Monthly audit:** ~80–150k tokens (reading all lessons + rewriting up to 3). Maybe $5–15.
- **On-demand:** varies, typically 30–60k for a lesson, higher for full tracks.

At this pace you're looking at maybe $20–40/month in API costs for fully automated content production. Cheaper than one hour of human writer time.

Set a monthly spend cap in the Anthropic console as a safety valve.

---

## When to Pause Autopilot

Rename `BACKLOG.md` to `BACKLOG.paused.md` to disable the weekly job (it no-ops if the file is missing). Rename back to resume.

For a full pause of all scheduled jobs: go to Actions tab → click each workflow → "Disable workflow." Re-enable when ready.

---

## Extending Later

Once you trust the system, some natural next steps:

- **Slack notifications on PR open:** add a `slackapi/slack-github-action` step that pings you when autopilot opens a PR. Useful if you don't live in GitHub.
- **Fact-check workflow:** a second Claude run that re-reads the PR diff and specifically checks factual claims against cited sources before marking the PR review-ready.
- **User-signal integration:** once you have analytics, feed quiz-failure rates into the monthly audit so lessons with real user confusion bubble to the top of the rewrite queue.
- **Reviewer-free path for pure maintenance:** glossary term additions and typo fixes could auto-merge with passing CI, since the risk is lower. Hold off on this until you have 6+ months of clean autopilot PRs.

---

## Troubleshooting

**"The weekly workflow didn't run."**
- GitHub auto-disables schedules after 60 days of repo inactivity. Check the workflow status in Actions tab. Re-enable if needed.
- Cron times are UTC. 9 UTC on Monday is Sunday night in US time zones.

**"Autopilot opened a PR but the lesson is low quality."**
- Update `LESSON_AUTHORING.md` — especially the gold-standard reference lesson in §6. That's the single highest-leverage edit you can make.
- Add the specific failure mode as a new rule in the "Don't" list of §2.

**"Autopilot keeps stopping with [NEEDS HUMAN]."**
- That's working as intended. Read the draft PR body — Claude explains why it stopped. Usually either an ambiguous request or a validation issue it couldn't fix.
- If the stop reason reveals a frequent pattern, update AUTOPILOT.md to handle that case automatically going forward.

**"I want to undo an autopilot commit."**
- You can't accidentally merge autopilot work (branch protection). But if a merged PR turns out to be bad, `git revert` the merge commit on a new branch and PR it — same process as reverting any other commit.

---

## Summary

You now have a content platform that runs itself:

- Every Monday: a new lesson PR appears for review
- Every first of the month: a quality audit PR with rewrites
- Any time you want something: dispatch from UI or comment `/autopilot` on an issue
- Everything goes through PR review — you're the gatekeeper for `main`

Total ongoing time commitment: probably 15–30 minutes a week.
Total content output: 4+ new lessons per month, plus continuous quality improvement on existing ones.

That's the whole system.
