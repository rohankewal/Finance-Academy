# PROJECT: Finance Academy MVP

## Mission
Build a w3schools-style interactive learning platform for financial literacy targeted at young people (ages 16–30). The site teaches money, debt, and investing through structured lessons, real examples, and interactive calculators. This MVP is the foundation — it must be built so that adding new lessons, tracks, and calculators later is trivial.

---

## Tech Stack (use exactly this — do not substitute)

- **Framework:** SvelteKit (latest, with Svelte 5 runes syntax) + TypeScript
- **Styling:** TailwindCSS + `@tailwindcss/typography` plugin (for lesson prose)
- **UI Primitives:** Bits UI (headless, accessible components — style everything with Tailwind)
- **Content:** `mdsvex` for lesson authoring (Markdown + Svelte components)
- **Charts:** LayerChart (Svelte-native, composable)
- **Icons:** `lucide-svelte`
- **State (client-only for MVP):** Svelte 5 runes + localStorage for progress tracking
- **Fonts:** Inter (body/headings), JetBrains Mono (numbers in calculators)
- **Deployment target:** Vercel (use `@sveltejs/adapter-vercel`)

Do NOT add: authentication, databases, backend APIs, analytics, or paid services. Everything must work statically / client-side.

---

## Project Structure (create exactly this)

```
/finance-academy
  /src
    /routes
      +layout.svelte                   # Root layout: TopNav + Sidebar + <slot />
      +layout.ts                       # Load track metadata for sidebar
      +page.svelte                     # Homepage
      /learn
        +page.svelte                   # Track index / overview
        /[track]
          +page.svelte                 # Track overview with lesson list
          /[lesson]
            +page.svelte               # Dynamic lesson page (renders mdsvex)
            +page.ts                   # Load MDX content + metadata
      /calculators
        +page.svelte                   # Calculator index
        /compound-interest/+page.svelte
        /debt-payoff/+page.svelte
        /budget-builder/+page.svelte
        /tax-brackets/+page.svelte
        /credit-card-trap/+page.svelte
      /glossary
        +page.svelte
    /lib
      /components
        /layout
          Sidebar.svelte
          TopNav.svelte
          Footer.svelte
          MobileDrawer.svelte
        /lesson
          LessonLayout.svelte          # Wraps mdsvex output
          TryItYourself.svelte         # Embed wrapper for calculators in lessons
          QuickQuiz.svelte
          KeyTakeaways.svelte
          NextPrevNav.svelte
          ProgressBar.svelte
          MarkCompleteButton.svelte
        /calculators
          CalculatorShell.svelte       # Shared wrapper: inputs | output | explainer
          CompoundInterestCalc.svelte
          DebtPayoffCalc.svelte
          BudgetBuilderCalc.svelte
          TaxBracketCalc.svelte
          CreditCardTrapCalc.svelte
        /ui                            # Styled wrappers around Bits UI primitives
          Button.svelte
          Card.svelte
          Input.svelte
          Slider.svelte
          Select.svelte
          Tabs.svelte
          Dialog.svelte
      /content
        /lessons
          /money-basics
            01-what-is-money.svx
            02-budgeting-basics.svx
            03-emergency-funds.svx
            04-credit-scores.svx
          /debt-101
            01-good-vs-bad-debt.svx
            02-credit-cards-explained.svx
            03-student-loans.svx
          /investing-fundamentals
            01-why-invest.svx
            02-compound-interest.svx
            03-stocks-vs-bonds.svx
            04-index-funds.svx
      /data
        tracks.ts                      # Track + lesson metadata
        glossary.ts                    # Glossary terms
        taxBrackets.ts                 # 2024 US federal brackets
      /math
        calculations.ts                # Pure finance math functions
      /stores
        progress.svelte.ts             # Progress tracking with runes + localStorage
      /utils
        format.ts                      # Currency, percent, number formatters
    app.css                            # Tailwind directives + CSS vars
    app.html
  /static
    /images
  svelte.config.js                     # Configure mdsvex
  tailwind.config.ts
  vite.config.ts
  package.json
  README.md
```

---

## Design System (follow this precisely)

### Colors (define as CSS variables in `app.css`, extend Tailwind theme)

```css
:root {
  --color-primary: 5 150 105;         /* emerald-600 */
  --color-primary-dark: 6 95 70;      /* emerald-800 */
  --color-accent: 245 158 11;         /* amber-500 */
  --color-danger: 220 38 38;          /* red-600 */
  --color-success: 22 163 74;         /* green-600 */
  --color-bg: 255 255 255;
  --color-surface: 250 250 250;       /* zinc-50 */
  --color-border: 228 228 231;        /* zinc-200 */
  --color-text: 24 24 27;             /* zinc-900 */
  --color-text-muted: 82 82 91;       /* zinc-600 */
}
```

Use them in Tailwind as `bg-primary`, `text-primary`, etc. by extending `tailwind.config.ts`.

### Typography
- Headings: Inter, bold, tracking-tight
- Body: Inter, regular, leading-relaxed
- Numbers in calculators: JetBrains Mono (adds a "data" feel)
- Base size: 16px; lesson prose: 17–18px for readability
- Use `@tailwindcss/typography` with a custom `prose` config for lesson pages

### Layout Pattern (w3schools-inspired, editorial feel)
- **Left sidebar** (fixed, 280px desktop): Track list, expandable accordions, completion checkmarks
- **Top nav**: Logo left, links (Learn, Calculators, Glossary) center, overall progress indicator right
- **Main content**: Max-width 760px for lessons, full width for calculators
- **Mobile**: Sidebar collapses into a Bits UI Dialog-based drawer via hamburger icon
- **Lesson page structure**: Breadcrumb → Title → Est. read time + progress → Content → Key Takeaways → Quick Quiz → Mark Complete button → Prev/Next nav

### Component Styling Rules
- Soft shadows (`shadow-sm`, occasional `shadow-md` on cards)
- Rounded corners: `rounded-lg` standard, `rounded-xl` for feature cards
- Generous whitespace — never cram content
- Calculators must feel like real tools: inputs in a left card, live output + chart on the right, explainer below
- **No generic AI-gradient hero blobs.** Keep it clean, editorial, confident — closer to Stripe docs or Linear than typical SaaS
- Subtle transitions (`transition-colors`, `transition-transform`) — no flashy animations

---

## Data Models

### Track metadata (`/src/lib/data/tracks.ts`)

```typescript
export type Lesson = {
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
};

export type Track = {
  slug: string;
  title: string;
  description: string;
  icon: string;     // lucide-svelte icon name
  accent: 'emerald' | 'amber' | 'blue';
  lessons: Lesson[];
};

export const TRACKS: Track[] = [
  {
    slug: 'money-basics',
    title: 'Money Basics',
    description: 'Start here. Learn how money, banking, and budgeting actually work.',
    icon: 'Wallet',
    accent: 'emerald',
    lessons: [
      { slug: 'what-is-money', title: 'What Is Money, Really?', description: '...', estimatedMinutes: 5 },
      { slug: 'budgeting-basics', title: 'Budgeting Basics', description: '...', estimatedMinutes: 7 },
      { slug: 'emergency-funds', title: 'Why You Need an Emergency Fund', description: '...', estimatedMinutes: 6 },
      { slug: 'credit-scores', title: 'How Credit Scores Work', description: '...', estimatedMinutes: 8 },
    ],
  },
  {
    slug: 'debt-101',
    title: 'Debt 101',
    description: 'Understand credit cards, loans, and how to not get crushed by them.',
    icon: 'CreditCard',
    accent: 'amber',
    lessons: [
      { slug: 'good-vs-bad-debt', title: 'Good Debt vs. Bad Debt', description: '...', estimatedMinutes: 6 },
      { slug: 'credit-cards-explained', title: 'How Credit Cards Actually Work', description: '...', estimatedMinutes: 8 },
      { slug: 'student-loans', title: 'Student Loans Demystified', description: '...', estimatedMinutes: 10 },
    ],
  },
  {
    slug: 'investing-fundamentals',
    title: 'Investing Fundamentals',
    description: 'From compound interest to index funds. Build lifelong wealth.',
    icon: 'TrendingUp',
    accent: 'emerald',
    lessons: [
      { slug: 'why-invest', title: 'Why Investing Matters', description: '...', estimatedMinutes: 5 },
      { slug: 'compound-interest', title: 'Compound Interest: The 8th Wonder', description: '...', estimatedMinutes: 7 },
      { slug: 'stocks-vs-bonds', title: 'Stocks vs. Bonds', description: '...', estimatedMinutes: 8 },
      { slug: 'index-funds', title: 'Why Index Funds Win', description: '...', estimatedMinutes: 9 },
    ],
  },
];
```

---

## Lesson Content Template (.svx format via mdsvex)

Every lesson file must follow this structure exactly:

```svelte
---
title: "Compound Interest: The 8th Wonder"
description: "Learn how your money can make money, and why starting early matters more than anything."
estimatedMinutes: 7
track: "investing-fundamentals"
order: 2
---

<script>
  import TryItYourself from '$lib/components/lesson/TryItYourself.svelte';
  import KeyTakeaways from '$lib/components/lesson/KeyTakeaways.svelte';
  import QuickQuiz from '$lib/components/lesson/QuickQuiz.svelte';
  import CompoundInterestCalc from '$lib/components/calculators/CompoundInterestCalc.svelte';
</script>

## The Big Idea

Compound interest means your money earns money — and then that money earns money too. Whether or not Einstein actually called it the 8th wonder of the world, the math is real.

## A Real Example

Imagine you invest $1,000 at age 20 in an index fund earning an average 8% per year. You never add another dollar.

- At age 30: $2,159
- At age 40: $4,661
- At age 50: $10,063
- At age 65: $31,920

<TryItYourself>
  <CompoundInterestCalc initialPrincipal={1000} initialRate={8} initialYears={45} />
</TryItYourself>

## Why Starting Early Beats Investing More

Meet Anna and Ben...
[continue with 2–3 more sections of real, engaging explanation]

<KeyTakeaways points={[
  "Compound interest means earning returns on your returns",
  "Time is more powerful than the amount you invest",
  "Starting at 22 vs 32 can double or triple your retirement savings",
  "Index funds are a common way to access compound growth"
]} />

<QuickQuiz
  question="If you invest $5,000 at age 25 at 7% and never add more, roughly how much will you have at 65?"
  options={[
    { text: "$15,000", correct: false },
    { text: "$40,000", correct: false },
    { text: "$75,000", correct: true },
    { text: "$200,000", correct: false }
  ]}
  explanation="At 7% annual return over 40 years, $5,000 becomes about $74,872. Time does the heavy lifting."
/>
```

**You must write full, engaging content for all 11 lessons.** Each lesson should be 400–700 words of real educational content — no placeholders, no lorem ipsum. Conversational, young-person-friendly tone. Concrete dollar examples. At least one `<TryItYourself>` embed per lesson where a calculator fits naturally.

---

## Calculator Specs (build all 5 fully)

### 1. Compound Interest Calculator
- **Inputs:** Initial principal ($), monthly contribution ($), annual return rate (%), years
- **Outputs:** Final balance, total contributed, total interest earned
- **Visualization:** LayerChart line/area chart showing balance year by year, with two stacked series: "Your contributions" and "Interest earned"
- **Defaults:** $1,000 / $200/mo / 8% / 30 years
- **Accept props** for preset values so it can be embedded in lessons

### 2. Debt Payoff Calculator
- **Inputs:** Dynamic list of debts (name, balance, APR, minimum payment — add/remove rows), extra monthly payment, strategy toggle (Avalanche vs Snowball)
- **Outputs:** Total months to payoff, total interest paid, payoff date, strategy comparison
- **Visualization:** Stacked area chart of balance over time per debt
- **Explainer:** Clear breakdown of avalanche (highest APR first) vs snowball (smallest balance first)

### 3. Budget Builder (50/30/20)
- **Inputs:** Monthly after-tax income, editable percent sliders for Needs / Wants / Savings (must sum to 100%)
- **Outputs:** Dollar allocation per category. Optional: user enters actual expenses and sees variance warnings
- **Visualization:** Donut chart (LayerChart)

### 4. Tax Bracket Explainer
- **Inputs:** Annual income, filing status (single / married filing jointly)
- **Outputs:** Effective tax rate, marginal tax rate, total federal tax, take-home pay
- **Visualization:** Horizontal stacked bar where each segment represents income taxed in a different bracket
- **Critical:** Must visually debunk the "a raise can cost me money by bumping me up a bracket" myth. Use 2024 US federal brackets from `/src/lib/data/taxBrackets.ts`

### 5. Credit Card Interest Trap
- **Inputs:** Balance, APR, monthly payment (with a "minimum only" toggle that auto-sets payment to 2% of balance, min $25)
- **Outputs:** Months to pay off, total interest paid, total amount paid
- **Visualization:** Two-line chart comparing "minimum payment" vs "minimum + $50/mo" trajectories
- **Explainer:** Explicitly show how small extra payments compound into thousands saved

### Universal calculator requirements
- Live-update outputs as inputs change (Svelte 5 `$state` + `$derived`)
- Validate inputs (no negatives, sensible ranges, clear error states)
- "What this teaches you" explainer section below the tool
- Embeddable via `<TryItYourself>` with preset props
- Responsive: inputs stack above output on mobile, side-by-side on desktop

---

## Core Math Functions (`/src/lib/math/calculations.ts`)

Implement and export pure TypeScript functions:

```typescript
compoundInterest({ principal, monthlyContribution, annualRate, years }): {
  yearlyBalances: { year: number; balance: number; contributed: number; interest: number }[];
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
}

debtPayoff({ debts, extraPayment, strategy }): {
  monthsToPayoff: number;
  totalInterest: number;
  payoffDate: Date;
  schedule: { month: number; balancesByDebt: Record<string, number> }[];
}

federalTax({ income, filingStatus }): {
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  bracketBreakdown: { rate: number; amountInBracket: number; taxFromBracket: number }[];
  takeHome: number;
}

amortize({ balance, apr, monthlyPayment }): {
  monthsToPayoff: number;
  totalInterest: number;
  schedule: { month: number; balance: number; interestPaid: number; principalPaid: number }[];
}
```

All functions must be pure, deterministic, and documented with JSDoc. Math must be accurate, not approximated.

---

## Progress Tracking (`/src/lib/stores/progress.svelte.ts`)

Use Svelte 5 runes with a class-based store synced to localStorage:

```typescript
class ProgressStore {
  completed = $state<Record<string, boolean>>({});

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finance-academy-progress');
      if (stored) this.completed = JSON.parse(stored);
    }
  }

  markComplete(trackSlug: string, lessonSlug: string) { /* ... persist ... */ }
  isComplete(trackSlug: string, lessonSlug: string): boolean { /* ... */ }
  trackProgress(trackSlug: string): number { /* ... returns 0–100 */ }
  overallProgress(): number { /* ... */ }
}

export const progress = new ProgressStore();
```

A lesson marks complete when the user clicks "Mark Complete" OR passes the Quick Quiz.

---

## Homepage (`/src/routes/+page.svelte`)

1. **Hero:** Large headline ("Learn money. Change your life."), subhead, two CTAs (Start Learning / Try a Calculator)
2. **Track cards grid:** 3 cards, one per track — icon, title, description, lesson count, progress bar if started, "Start track" button
3. **"What you'll learn" section:** 6 icon + text items (Budgeting, Investing, Debt, Credit, Taxes, Retirement) — note some are on the roadmap for future tracks
4. **Featured calculators section:** 3 preview cards linking to the calculators
5. **Footer:** Links, disclaimer ("Educational content only — not financial advice")

---

## Glossary Page (`/src/routes/glossary/+page.svelte`)

- Searchable list of at least 40 terms (APR, APY, compound interest, index fund, ETF, 401k, Roth IRA, credit utilization, amortization, dollar-cost averaging, expense ratio, etc.)
- Each term: name, short definition, optional "learn more" link to the relevant lesson
- Alphabetical sections with jump links
- Terms live in `/src/lib/data/glossary.ts` as a typed array

---

## Acceptance Criteria (done when ALL are true)

- [ ] All 3 tracks built with all 11 lessons fully written (real content, 400–700 words each)
- [ ] All 5 calculators functional, live-updating, visually polished
- [ ] At least 5 lessons embed a calculator via `<TryItYourself>`
- [ ] Sidebar navigation works, shows completion checkmarks, collapses on mobile
- [ ] Progress persists across refreshes via localStorage
- [ ] Homepage, glossary, all lesson + calculator pages responsive (375px, 768px, 1280px)
- [ ] No console errors, no TypeScript errors, no broken links
- [ ] `npm run build` succeeds cleanly; deployable to Vercel
- [ ] README.md documents: setup, how to add a new lesson, how to add a new calculator, how to add a new track
- [ ] Disclaimer footer on every page: "Finance Academy is for educational purposes only and does not constitute financial advice."

---

## Tone & Writing Style for Lessons

- Second person ("you")
- Short paragraphs (2–4 sentences)
- Concrete dollar examples over abstractions
- Acknowledge reader skepticism and financial anxiety — don't lecture
- No jargon without defining it on first use
- End each lesson with something empowering and actionable

---

## Build Order (execute in this sequence)

1. Scaffold SvelteKit project with TypeScript, install Tailwind + Bits UI + mdsvex + LayerChart + lucide-svelte
2. Configure `svelte.config.js` for mdsvex (`.svx` extension), Tailwind, and path aliases
3. Build `app.css` with CSS vars + Tailwind theme extension; set up fonts
4. Build layout shell: TopNav, Sidebar, Footer, MobileDrawer
5. Build base UI primitives (Button, Card, Input, Slider, Select, Tabs, Dialog) wrapping Bits UI
6. Build `/src/lib/math/calculations.ts` with all four math functions
7. Build 5 calculator components + their standalone pages
8. Build lesson components: LessonLayout, TryItYourself, QuickQuiz, KeyTakeaways, NextPrevNav, MarkCompleteButton
9. Write all 11 lessons as `.svx` files with real content
10. Wire up dynamic `/learn/[track]/[lesson]` routing with proper metadata loading
11. Build homepage
12. Build glossary
13. Implement progress store and wire completion checkmarks into sidebar
14. Mobile responsiveness pass (test 375 / 768 / 1280)
15. Polish: empty states, loading states, subtle transitions
16. Write README.md

---

## What NOT to do

- Don't add authentication or user accounts
- Don't use placeholder / lorem ipsum anywhere — write real lesson content
- Don't skip any of the 5 calculators or stub them out
- Don't use more than 3 primary colors; keep palette tight
- Don't over-engineer state (no external state libraries — Svelte 5 runes + localStorage only)
- Don't generate AI-generic hero illustrations; lean on clean typography + lucide icons
- Don't approximate the math — calculations must be correct
- Don't use Svelte 4 store syntax — use Svelte 5 runes (`$state`, `$derived`, `$effect`) throughout

---

Ask clarifying questions ONLY if something in this spec contradicts itself. Otherwise, proceed with the full build and deliver a working, deployable MVP.
