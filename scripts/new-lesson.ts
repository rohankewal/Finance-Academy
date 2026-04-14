#!/usr/bin/env node
/**
 * scripts/new-lesson.ts
 *
 * Scaffolds a new lesson .svx file with correct frontmatter, folder path,
 * and registers it in tracks.ts.
 *
 * Usage:
 *   npm run lessons:new -- --track=investing-fundamentals --title="Dollar-Cost Averaging" --order=5 --minutes=7
 *   npm run lessons:new -- --track investing-fundamentals --title "Dollar-Cost Averaging" --order 5 --minutes 7
 *
 * After scaffolding, open the generated file and hand it to Claude Code with:
 *   "Read LESSON_AUTHORING.md and fill in this lesson stub."
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// -- Arg parsing -------------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eqIdx = a.indexOf('=');
      if (eqIdx > -1) {
        args[a.slice(2, eqIdx)] = a.slice(eqIdx + 1);
      } else {
        args[a.slice(2)] = argv[i + 1] ?? '';
        i++;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const required = ['track', 'title', 'order', 'minutes'];
for (const key of required) {
  if (!args[key]) {
    console.error(`Missing --${key}`);
    console.error(
      'Usage: npm run lessons:new -- --track=<slug> --title="..." --order=<n> --minutes=<n> [--calculator=<name>] [--tags=a,b,c]'
    );
    process.exit(1);
  }
}

const trackSlug = args.track;
const title = args.title;
const order = parseInt(args.order, 10);
const minutes = parseInt(args.minutes, 10);
const calculator = args.calculator ?? '';
const tags = (args.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);

// -- Helpers -----------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

const lessonSlug = slugify(title);
const filename = `${pad2(order)}-${lessonSlug}.svx`;
const lessonsDir = path.join(ROOT, 'src/lib/content/lessons', trackSlug);
const filepath = path.join(lessonsDir, filename);

// -- Validate track exists ---------------------------------------------------

const tracksPath = path.join(ROOT, 'src/lib/data/tracks.ts');
if (!fs.existsSync(tracksPath)) {
  console.error(`tracks.ts not found at ${tracksPath}`);
  process.exit(1);
}
const tracksSrc = fs.readFileSync(tracksPath, 'utf8');
if (!tracksSrc.includes(`slug: '${trackSlug}'`) && !tracksSrc.includes(`slug: "${trackSlug}"`)) {
  console.error(`Track "${trackSlug}" not found in tracks.ts. Add the track first.`);
  process.exit(1);
}

// -- Check order collision ---------------------------------------------------

if (fs.existsSync(lessonsDir)) {
  const existing = fs.readdirSync(lessonsDir);
  const collision = existing.find((f) => f.startsWith(`${pad2(order)}-`));
  if (collision) {
    console.error(`Order collision: ${collision} already uses order ${order} in ${trackSlug}.`);
    console.error('Pick a different --order or reorder existing lessons.');
    process.exit(1);
  }
}

// -- Calculator import block -------------------------------------------------

const CALCULATORS: Record<string, { import: string; sampleProps: string }> = {
  CompoundInterestCalc: {
    import: `import CompoundInterestCalc from '$lib/components/calculators/CompoundInterestCalc.svelte';`,
    sampleProps: `initialPrincipal={1000} initialMonthly={200} initialRate={8} initialYears={30}`
  },
  DebtPayoffCalc: {
    import: `import DebtPayoffCalc from '$lib/components/calculators/DebtPayoffCalc.svelte';`,
    sampleProps: `initialExtra={100} initialStrategy="avalanche"`
  },
  BudgetBuilderCalc: {
    import: `import BudgetBuilderCalc from '$lib/components/calculators/BudgetBuilderCalc.svelte';`,
    sampleProps: `initialIncome={4000}`
  },
  TaxBracketCalc: {
    import: `import TaxBracketCalc from '$lib/components/calculators/TaxBracketCalc.svelte';`,
    sampleProps: `initialIncome={60000} initialFilingStatus="single"`
  },
  CreditCardTrapCalc: {
    import: `import CreditCardTrapCalc from '$lib/components/calculators/CreditCardTrapCalc.svelte';`,
    sampleProps: `initialBalance={3000} initialApr={22} minimumOnly={true}`
  }
};

let calcImport = '';
let calcEmbed = '  <!-- TODO: embed a calculator with <TryItYourself> -->';
if (calculator) {
  const match = CALCULATORS[calculator];
  if (!match) {
    console.error(`Unknown calculator "${calculator}". Valid: ${Object.keys(CALCULATORS).join(', ')}`);
    process.exit(1);
  }
  calcImport = '\n  ' + match.import;
  calcEmbed = `<TryItYourself>
  <${calculator} ${match.sampleProps} />
</TryItYourself>`;
}

// -- Build file content ------------------------------------------------------

const tagsYaml = tags.length ? tags.map((t) => `"${t}"`).join(', ') : '';

const content = `---
title: "${title}"
description: "TODO: one-sentence hook under 140 characters."
estimatedMinutes: ${minutes}
track: "${trackSlug}"
order: ${order}
tags: [${tagsYaml}]
glossaryTerms: []
---

<script>
  import TryItYourself from '$lib/components/lesson/TryItYourself.svelte';
  import KeyTakeaways from '$lib/components/lesson/KeyTakeaways.svelte';
  import QuickQuiz from '$lib/components/lesson/QuickQuiz.svelte';${calcImport}
</script>

<!--
  STUB — fill in following LESSON_AUTHORING.md.
  Target: 500–700 words of body prose.
  Structure:
    1. Opening hook (1–2 paragraphs, no heading)
    2. ## The Big Idea (TL;DR in 2–4 sentences)
    3. 2–4 body sections, each with a ## heading
    4. At least one <TryItYourself> embed
    5. <KeyTakeaways> with 3–5 points
    6. <QuickQuiz> with one correct answer
-->

TODO: Write a 1–2 paragraph opening hook here. Relatable scenario, surprising fact, or direct question. No heading yet.

## The Big Idea

TODO: 2–4 sentence TL;DR of the lesson's core concept.

## TODO: First Body Section

TODO: Explain one sub-concept with a concrete dollar example.

## TODO: Second Body Section

TODO: Build on the first section. Another concrete example.

${calcEmbed}

## TODO: Final Section — What This Means for You

TODO: Bring it home. Give the reader something actionable and empowering.

<KeyTakeaways points={[
  "TODO: first takeaway",
  "TODO: second takeaway",
  "TODO: third takeaway"
]} />

<QuickQuiz
  question="TODO: one clear question testing the core concept"
  options={[
    { text: "TODO: option A", correct: false },
    { text: "TODO: option B (correct)", correct: true },
    { text: "TODO: option C", correct: false },
    { text: "TODO: option D", correct: false }
  ]}
  explanation="TODO: explain why the correct answer is correct and what the reader should take away."
/>
`;

// -- Write file --------------------------------------------------------------

fs.mkdirSync(lessonsDir, { recursive: true });
if (fs.existsSync(filepath)) {
  console.error(`File already exists: ${filepath}`);
  process.exit(1);
}
fs.writeFileSync(filepath, content, 'utf8');

// -- Register in tracks.ts ---------------------------------------------------
// We do a surgical insert: find the track's lessons array and append a new lesson entry.

const lessonEntry = `      { slug: '${lessonSlug}', title: '${title.replace(/'/g, "\\'")}', description: 'TODO', estimatedMinutes: ${minutes} },`;

const trackBlockRegex = new RegExp(
  `(slug:\\s*['"]${trackSlug}['"][\\s\\S]*?lessons:\\s*\\[)([\\s\\S]*?)(\\n\\s*\\],?\\s*\\n\\s*\\})`,
  'm'
);
const newTracksSrc = tracksSrc.replace(trackBlockRegex, (_m, pre, body, post) => {
  const trimmed = body.replace(/\s+$/, '');
  const sep = trimmed.endsWith(',') || trimmed === '' ? '' : ',';
  return `${pre}${trimmed}${sep}\n${lessonEntry}${post}`;
});

if (newTracksSrc === tracksSrc) {
  console.warn(
    `⚠  Could not auto-register in tracks.ts. Add this entry manually to the "${trackSlug}" track:`
  );
  console.warn(lessonEntry);
} else {
  fs.writeFileSync(tracksPath, newTracksSrc, 'utf8');
  console.log(`✓ Registered in tracks.ts`);
}

console.log(`✓ Created ${path.relative(ROOT, filepath)}`);
console.log('');
console.log('Next steps:');
console.log(`  1. Open ${path.relative(ROOT, filepath)} in your editor OR`);
console.log(`  2. Run Claude Code with: "Read LESSON_AUTHORING.md and fill in the stub at ${path.relative(ROOT, filepath)}"`);
console.log(`  3. After filling in: npm run lessons:validate`);
