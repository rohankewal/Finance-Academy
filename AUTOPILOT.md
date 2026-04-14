# AUTOPILOT.md — Finance Academy Content Orchestrator

This document is the master prompt Claude reads to perform any content task end-to-end. It replaces the need for a human to run scripts manually. Claude reads this, figures out what's being asked, and executes the right workflow with its own bash access.

**Every content task starts with: "Read AUTOPILOT.md and execute."**

---

## Core Principles (violations = stop)

1. **Never commit directly to `main`.** Always work on a branch and open a pull request. The human is the final reviewer.
2. **Never skip validation.** Every workflow ends with `npm run lessons:validate` passing. If it fails 3 times in a row, stop and open the PR as a draft with a `[NEEDS HUMAN]` label.
3. **Read `LESSON_AUTHORING.md` before writing any content.** It is the style source of truth. `AUTOPILOT.md` handles workflow; `LESSON_AUTHORING.md` handles quality.
4. **When in doubt, stop and ask.** Don't guess at curriculum decisions, don't invent track slugs, don't skip review steps. A stopped autopilot is recoverable; a wrong lesson merged is not.
5. **One task per run.** Don't chain "write a lesson AND audit the site AND add a track" into one session. Pick the highest-priority task, do it well, open the PR, exit.

---

## Task Router

When invoked, identify which task type is being requested and follow the matching workflow.

| Trigger phrase / context | Workflow |
|---|---|
| "add a lesson on X" / "write a lesson about X" | **Workflow A — Single Lesson** |
| "add a track on X" / "create an X track with N lessons" | **Workflow B — Full Track** |
| "audit the site" / "run the monthly audit" / scheduled monthly cron | **Workflow C — Quality Audit + Rewrite** |
| "pick from backlog" / "weekly content drop" / scheduled weekly cron | **Workflow D — Backlog Pull** |
| "update the glossary" / "add terms" | **Workflow E — Glossary Maintenance** |
| Anything else | **Stop and ask the human what they want.** |

---

## Workflow A — Single Lesson

**Trigger:** Human or cron asks for one specific lesson.

**Steps:**

1. **Gather parameters.** Extract from the request: track slug, lesson title, target order, estimated minutes, which calculator to embed. If any are ambiguous or missing, infer them from `tracks.ts` and the topic — but if the track doesn't exist yet, **stop** and suggest using Workflow B instead.

2. **Create a branch.**
   ```bash
   git checkout -b content/lesson-<track-slug>-<lesson-slug>
   ```

3. **Scaffold the lesson.**
   ```bash
   npm run lessons:new -- \
     --track=<slug> \
     --title="..." \
     --order=<n> \
     --minutes=<n> \
     --calculator=<CalcName> \
     --tags=<comma,separated>
   ```

4. **Read `LESSON_AUTHORING.md`** and fill in the stub. Match the gold-standard reference in §6 exactly for tone, structure, and depth. 500–700 words of body prose.

5. **Add new glossary terms** to `/src/lib/data/glossary.ts` if any are introduced. Update the lesson's `glossaryTerms` frontmatter to match.

6. **Validate.**
   ```bash
   npm run lessons:validate
   ```
   Fix any failures. Re-run until clean. If still failing after 3 attempts, open a **draft PR** with `[NEEDS HUMAN]` in the title and a summary of what's failing.

7. **Audit.**
   ```bash
   npm run lessons:audit
   ```
   If the new lesson scores below 80, revise until it scores 80+ or open a draft PR explaining why a low score is acceptable (e.g., highly technical topic).

8. **Commit and push.**
   ```bash
   git add .
   git commit -m "content: add lesson '<title>' to <track>"
   git push -u origin HEAD
   ```

9. **Open a pull request** using `gh pr create`. The PR body must include:
   - One-sentence summary of the lesson
   - Validator output (proof it passes)
   - Audit score and flags
   - Any new glossary terms added
   - A "Reviewer checklist" with boxes for: factual accuracy, tone fit, example quality

10. **Stop.** Don't start another task.

---

## Workflow B — Full Track

**Trigger:** Human asks for a whole new track.

**Critical rule:** This workflow is **two-phase**. Never write all the lessons in one session without human approval of the curriculum outline. Curriculum drift is the #1 killer of educational platforms.

**Phase 1 — Propose:**

1. Create a branch: `git checkout -b content/track-<slug>-proposal`
2. Run: `npm run lessons:plan -- --track="..." --slug=... --lessons=<n> --audience=beginner`
3. Read the generated plan prompt file in `/plans/<slug>-plan.md`.
4. Read `LESSON_AUTHORING.md`.
5. Produce the curriculum proposal table following the format in the plan prompt. Write it to `/plans/<slug>-curriculum.md`.
6. Commit and push.
7. Open a PR titled `PROPOSAL: <track name> curriculum (needs approval before writing)`. Tag it `content-proposal`. The PR body must say explicitly: **"Do not merge. Approve curriculum by commenting 'approved' or request changes. A separate PR will follow with the written lessons."**
8. **Stop.** Do not proceed to Phase 2 without human approval.

**Phase 2 — Write (only after human comments "approved" on the proposal PR or explicitly invokes this phase):**

1. Create a new branch: `git checkout -b content/track-<slug>-lessons`
2. Read the approved curriculum from `/plans/<slug>-curriculum.md`.
3. Register the new track in `/src/lib/data/tracks.ts`.
4. For each approved lesson, run `npm run lessons:new` to scaffold, then fill it in per `LESSON_AUTHORING.md`.
5. Add all new glossary terms.
6. Run `npm run lessons:validate` and `npm run lessons:audit`. Fix until both pass.
7. Commit, push, open PR titled `content: <track name> track (N lessons)`.
8. PR body must include per-lesson summaries, total word count, audit scores, and validator output.
9. **Stop.**

---

## Workflow C — Quality Audit + Rewrite

**Trigger:** Monthly cron or human asks for audit.

**Steps:**

1. Create a branch: `git checkout -b maintenance/audit-<YYYY-MM>`
2. Run: `npm run lessons:audit -- --json > /tmp/audit.json`
3. Parse the audit output. Identify lessons with `score < 80`.
4. If zero lessons are flagged: open a PR titled `maintenance: monthly audit YYYY-MM — all green` with the report attached. Done.
5. If 1–3 lessons are flagged: rewrite all of them in this PR.
6. If 4+ lessons are flagged: rewrite only the **3 lowest-scoring** lessons in this PR. Note in the PR body that more rewrites are needed — a second audit PR should be opened after this one merges.
7. For each rewrite:
   - Read the original lesson
   - Read `LESSON_AUTHORING.md` (especially the gold-standard reference)
   - Read the specific audit flags for this lesson (short prose, low "you" density, etc.)
   - Rewrite preserving the lesson's core teaching goal but fixing every flagged issue
   - Do not change the frontmatter `order`, `slug`, or `track` — only the content
8. Run `npm run lessons:validate` and `npm run lessons:audit` — confirm all rewritten lessons now score 80+.
9. Commit with message `maintenance: rewrite N lessons per YYYY-MM audit`.
10. Push and open PR with before/after audit scores in a table.
11. **Stop.**

---

## Workflow D — Backlog Pull

**Trigger:** Weekly cron.

**Steps:**

1. Read `/BACKLOG.md`.
2. Find the highest-priority unchecked item (first `- [ ]` bullet from the top of the "Lesson Ideas" section).
3. If backlog is empty: create an issue titled `BACKLOG: empty — add topic ideas` and stop.
4. Parse the item. Format is:
   ```
   - [ ] <track-slug> | <title> | <one-sentence core concept> | [calculator: CompoundInterestCalc]
   ```
5. Execute **Workflow A** using these parameters.
6. After the PR is opened, update `/BACKLOG.md` to change `- [ ]` to `- [x]` on that item with a link to the PR. Commit this backlog update as a separate commit on the same branch so the PR includes it.
7. **Stop.**

---

## Workflow E — Glossary Maintenance

**Trigger:** Human asks to add or improve glossary terms.

**Steps:**

1. Branch: `git checkout -b maintenance/glossary-<date>`
2. Read the request carefully — which terms to add or improve?
3. Edit `/src/lib/data/glossary.ts`. Each entry must have:
   - `term` (case-sensitive as used in lessons)
   - `definition` (plain-language, 1–2 sentences, 9th-grade reading level)
   - `lessonSlug` (optional — link to primary lesson)
4. Run `npm run lessons:validate` — it will surface any lessons referencing now-undefined or now-defined terms.
5. Commit, push, open PR titled `glossary: add/update N terms`.
6. **Stop.**

---

## Stop Conditions (mandatory)

Regardless of workflow, **stop immediately and open a draft PR labeled `[NEEDS HUMAN]`** if any of these occur:

- Validation fails 3 times after your fix attempts
- You're unsure which track a lesson belongs to
- A requested lesson would duplicate an existing lesson's core concept
- A requested track overlaps significantly with an existing track
- The `tracks.ts` file is in a broken state
- `git push` fails
- You encounter a factual claim you can't verify confidently (especially tax rates, retirement account limits, interest rate figures)
- The human's request is ambiguous or contradicts something in `LESSON_AUTHORING.md`
- You would need to touch more than 15 files to complete the task

A stopped autopilot is safe. A confused autopilot that pushes forward is dangerous.

---

## PR Template (use this exact format)

```markdown
## What

<one-sentence summary>

## Workflow

<A / B Phase 1 / B Phase 2 / C / D / E>

## Files changed

- [new] src/lib/content/lessons/<track>/<file>.svx
- [modified] src/lib/data/tracks.ts (registered new lesson)
- [modified] src/lib/data/glossary.ts (added N terms)

## Quality checks

- Validator: ✓ pass
- Audit score: 87/100
- Audit flags: none
- Word count: 612

## Reviewer checklist

- [ ] Factual accuracy of examples (especially dollar figures, rates, dates)
- [ ] Tone matches gold-standard reference
- [ ] Examples are concrete and age-appropriate
- [ ] No inadvertent brand/product recommendations
- [ ] Quiz correct answer is actually correct
- [ ] KeyTakeaways genuinely summarize the lesson

## Notes for reviewer

<anything unusual, any judgment calls you made, any questions>
```

---

## Facts You Must Verify Before Writing

Never invent or approximate these. If unsure, stop and flag for human verification:

- Current US federal tax brackets (check `/src/lib/data/taxBrackets.ts` as source of truth)
- Current contribution limits for 401(k), IRA, Roth IRA, HSA
- Current federal student loan interest rates
- Current Fed funds rate if referenced
- Social Security full retirement age
- Any specific historical market return figure (use "approximately 7–10% long-term average for broad US stock market" rather than specific decade figures unless verified)

When in doubt, use illustrative round numbers ("assuming an 8% average return") rather than specific claims ("the S&P returned 10.2% in 2023").

---

## Session End Protocol

After every run, regardless of workflow:

1. Confirm a PR was opened (or a draft PR if stuck).
2. Post a summary comment on the PR tagging `@<reviewer>` (configured in the workflow env).
3. Exit cleanly. Do not start another task even if one seems obvious.
4. If the session is a scheduled cron run, append one line to `/AUTOPILOT_LOG.md`:
   ```
   YYYY-MM-DD HH:MM UTC | workflow=<A-E> | pr=<url> | status=<opened|draft|stopped>
   ```

---

## One Final Rule

If you ever feel like the workflow in this document is getting in the way of doing the right thing, **stop and tell the human**. Don't route around it. The rules exist because an educational platform about money owes its readers accuracy and consistency. The rules get updated through human edits to this file, not through autopilot improvisation.
