# Finance Academy

A w3schools-style interactive financial literacy platform for young people (ages 16–30). Teaches money, debt, and investing through structured lessons, real examples, and interactive calculators.

**Live at:** deploy to Vercel in one command (see below)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 (runes syntax) |
| Styling | TailwindCSS + `@tailwindcss/typography` |
| UI Primitives | Bits UI (headless) |
| Content | mdsvex (Markdown + Svelte in `.svx` files) |
| Charts | Custom SVG (inline, reactive) |
| Icons | lucide-svelte |
| State | Svelte 5 runes + localStorage |
| Deployment | Vercel (`@sveltejs/adapter-vercel`) |

---

## Setup

```bash
# Clone and install
git clone <repo-url>
cd finance_academy
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Requires Node.js 18, 20, or 22. (Node 25 is not yet supported by the Vercel adapter.)

---

## How to Add a New Lesson

### 1. Create the `.svx` content file

Add a file to `src/lib/content/lessons/<track-slug>/`:

```
src/lib/content/lessons/money-basics/05-banking-basics.svx
```

Use this frontmatter template:

```svelte
---
title: "Banking Basics"
description: "Checking vs savings, high-yield accounts, and what FDIC insurance actually means."
estimatedMinutes: 6
track: "money-basics"
order: 5
---

<script>
  import KeyTakeaways from '$lib/components/lesson/KeyTakeaways.svelte';
  import QuickQuiz from '$lib/components/lesson/QuickQuiz.svelte';
</script>

## Your First Section

Write 400–700 words of real educational content here...

<KeyTakeaways points={[
  "First takeaway",
  "Second takeaway",
]} />

<QuickQuiz
  question="Quiz question here?"
  options={[
    { text: "Wrong answer", correct: false },
    { text: "Right answer", correct: true },
  ]}
  explanation="Explanation of why the correct answer is correct."
/>
```

### 2. Register it in `tracks.ts`

Open `src/lib/data/tracks.ts` and add the lesson to the correct track's `lessons` array:

```typescript
{
  slug: 'banking-basics',       // must match the filename (without numeric prefix)
  title: 'Banking Basics',
  description: 'Checking vs savings, high-yield accounts, and FDIC insurance.',
  estimatedMinutes: 6,
},
```

That's it. The lesson will automatically appear in the sidebar, progress tracking, and prev/next navigation.

---

## How to Add a New Calculator

### 1. Create the calculator component

Add a Svelte component at `src/lib/components/calculators/MyCalc.svelte`.

The calculator should be self-contained: inputs, outputs, and a chart/visualization all in one component. Use Svelte 5 runes:

```svelte
<script lang="ts">
  import { formatCurrency } from '$lib/utils/format';
  import Slider from '$lib/components/ui/Slider.svelte';

  let value = $state(1000);
  const result = $derived(/* your calculation */);
</script>

<!-- inputs, outputs, chart -->
```

### 2. Create the standalone route

Add `src/routes/calculators/my-calculator/+page.svelte`:

```svelte
<script lang="ts">
  import MyCalc from '$lib/components/calculators/MyCalc.svelte';
</script>

<svelte:head>
  <title>My Calculator — Finance Academy</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
  <h1 class="text-3xl font-bold tracking-tight text-zinc-900 mb-6">My Calculator</h1>
  <MyCalc />
</div>
```

### 3. Add to the calculator index

Open `src/routes/calculators/+page.svelte` and add an entry to the `CALCS` array:

```typescript
{
  href: '/calculators/my-calculator',
  title: 'My Calculator',
  description: 'What this calculator helps with.',
  icon: '...SVG path...',
  tag: 'Investing',
  color: 'emerald',
},
```

### 4. Add math functions (if needed)

Pure calculation functions live in `src/lib/math/calculations.ts`. Add your function there with JSDoc comments. Keep them pure and deterministic — no side effects.

### 5. Embed in a lesson (optional)

Use `<TryItYourself>` in any `.svx` lesson file:

```svelte
<script>
  import TryItYourself from '$lib/components/lesson/TryItYourself.svelte';
  import MyCalc from '$lib/components/calculators/MyCalc.svelte';
</script>

<TryItYourself title="Try It Yourself">
  <MyCalc initialValue={500} />
</TryItYourself>
```

---

## How to Add a New Track

### 1. Add track metadata in `tracks.ts`

```typescript
{
  slug: 'retirement-planning',
  title: 'Retirement Planning',
  description: 'Build a secure retirement with 401(k)s, IRAs, and Social Security.',
  icon: 'Clock',            // lucide-svelte icon name
  accent: 'blue',           // 'emerald' | 'amber' | 'blue'
  lessons: [
    {
      slug: 'intro-to-retirement',
      title: 'Why Retirement Planning Starts Now',
      description: '...',
      estimatedMinutes: 6,
    },
    // ... more lessons
  ],
},
```

### 2. Create lesson content directory

```bash
mkdir src/lib/content/lessons/retirement-planning
```

### 3. Write lesson files

Follow the lesson template above for each lesson in the track. Filename format: `01-intro-to-retirement.svx`, `02-next-lesson.svx`, etc. (numeric prefix is optional — the slug in `tracks.ts` is what the router uses).

That's all — the sidebar, routing, progress tracking, and navigation all pick up new tracks automatically.

---

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte          # Root layout with TopNav + Sidebar
│   ├── +page.svelte            # Homepage
│   ├── learn/
│   │   ├── +page.svelte        # Track index
│   │   ├── [track]/+page.svelte          # Track overview
│   │   └── [track]/[lesson]/+page.svelte # Dynamic lesson page
│   ├── calculators/            # Calculator index + 5 standalone pages
│   └── glossary/+page.svelte
├── lib/
│   ├── components/
│   │   ├── layout/   # TopNav, Sidebar, Footer, MobileDrawer
│   │   ├── lesson/   # LessonLayout, QuickQuiz, KeyTakeaways, etc.
│   │   ├── calculators/  # 5 calculator components + CalculatorShell
│   │   └── ui/       # Button, Card, Input, Slider, Select, Tabs, Dialog
│   ├── content/lessons/   # .svx lesson files organized by track
│   ├── data/
│   │   ├── tracks.ts       # Track + lesson metadata (source of truth)
│   │   ├── glossary.ts     # 50+ glossary terms
│   │   └── taxBrackets.ts  # 2024 US federal tax brackets
│   ├── math/calculations.ts   # Pure financial math functions
│   ├── stores/progress.svelte.ts  # Progress tracking with localStorage
│   └── utils/format.ts    # Currency, percent, number formatters
└── app.css                # Tailwind directives + CSS custom properties
```

---

## Design System

CSS custom properties (defined in `app.css`, extended in `tailwind.config.ts`):

| Variable | Color | Tailwind class |
|---|---|---|
| `--color-primary` | Emerald 600 | `bg-primary`, `text-primary` |
| `--color-accent` | Amber 500 | `bg-accent`, `text-accent` |
| `--color-danger` | Red 600 | `bg-danger`, `text-danger` |
| `--color-success` | Green 600 | `bg-success`, `text-success` |
| `--color-surface` | Zinc 50 | `bg-surface` |
| `--color-border` | Zinc 200 | `border-border` |

Fonts: Inter (headings/body), JetBrains Mono (calculator numbers via `.font-calc` class).

---

## Deployment

```bash
# Deploy to Vercel
npx vercel

# Or connect the GitHub repo to Vercel for automatic deploys on push
```

The project uses `@sveltejs/adapter-vercel` with `runtime: 'nodejs22.x'`. No environment variables required — everything runs client-side.

---

## Disclaimer

Finance Academy is for educational purposes only and does not constitute financial advice. Always consult a qualified financial advisor before making investment decisions.
