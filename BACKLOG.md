# Content Backlog

This file is the autopilot's work queue. Every Monday morning, the weekly autopilot workflow reads this file, picks the top unchecked item, writes the lesson, and opens a PR.

**Format:** Each item must follow this exact schema so the autopilot can parse it:

```
- [ ] <track-slug> | <Lesson Title> | <one-sentence core concept> | calculator: <CalcName or none>
```

To queue a new lesson, just add a bullet to the "Lesson Ideas" section. Ordering matters — the autopilot pulls from the top.

When a lesson ships, the autopilot marks it `- [x]` and links the PR.

---

## Lesson Ideas (autopilot pulls from the top)

### Money Basics track

- [x] money-basics | Checking vs. Savings Accounts | The difference between daily-use accounts and interest-earning accounts, and why you need both | calculator: none — PR: https://github.com/rohankewal/Finance-Academy/pull/3
- [ ] money-basics | High-Yield Savings Accounts | Why a HYSA beats a traditional savings account and how to pick one | calculator: CompoundInterestCalc
- [ ] money-basics | How Banks Actually Make Money | Fractional reserve banking explained simply, so you understand what your bank is doing with your deposits | calculator: none

### Debt 101 track

- [ ] debt-101 | Understanding APR vs. APY | The two rate terms that confuse everyone, finally made clear | calculator: none
- [ ] debt-101 | How to Read a Credit Card Statement | Line-by-line tour of a real statement, with every fee and charge explained | calculator: CreditCardTrapCalc
- [ ] debt-101 | Debt Consolidation: When It Helps, When It Hurts | Clear rules for when consolidation is a smart move and when it's a trap | calculator: DebtPayoffCalc
- [ ] debt-101 | Your Credit Utilization Ratio | Why keeping balances under 30% of your limit matters more than you think | calculator: none

### Investing Fundamentals track

- [ ] investing-fundamentals | Dollar-Cost Averaging | Why investing a fixed amount on a schedule beats trying to time the market | calculator: CompoundInterestCalc
- [ ] investing-fundamentals | Expense Ratios: The Silent Fee | How a 1% fee steals hundreds of thousands over a lifetime | calculator: CompoundInterestCalc
- [ ] investing-fundamentals | Risk Tolerance and Age | Why a 25-year-old and a 60-year-old should invest differently | calculator: none
- [ ] investing-fundamentals | The Three-Fund Portfolio | A simple, low-cost portfolio that beats most professionals | calculator: none

### Future tracks (add as they're created)

<!-- When a new track is created via Workflow B, add a section header for it here. -->

---

## Shipped

<!-- Autopilot moves completed items here automatically with PR links. -->

---

## How to Use This File

**To queue a lesson:** Add a bullet under the relevant track section, following the format. Put it where you want it in the priority order.

**To request a whole new track:** Don't add it here. Instead, directly prompt Claude Code: *"Read AUTOPILOT.md and execute Workflow B for a new track on [topic]."* The autopilot will propose the curriculum, open a proposal PR for your approval, then (after you approve) write all the lessons.

**To pause autopilot:** Rename this file to `BACKLOG.paused.md`. The weekly workflow checks for `BACKLOG.md` exactly and will no-op if missing. Rename back when ready.

**To force a specific lesson next:** Move it to the top of the list. Autopilot always pulls from the top.

**To request urgency:** Add `🔥` at the start of a bullet. (Currently cosmetic for your sanity; no autopilot behavior change.)

---

## Reviewer Notes

When reviewing PRs that come from this backlog, the key things to check:

1. Does the lesson actually cover the "core concept" listed here? If the autopilot drifted, flag it.
2. Are the dollar examples realistic for the target audience (ages 16–30)?
3. Is the tone consistent with the gold-standard reference lesson?
4. Did any new glossary terms get added, and are the definitions solid?

If a PR consistently fails on point 1, that's a signal the backlog item was underspecified — rewrite the core concept to be more precise before queueing similar items.
