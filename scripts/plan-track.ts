#!/usr/bin/env node
/**
 * scripts/plan-track.ts
 *
 * Produces two ready-to-paste Claude Code prompts:
 *   1. A curriculum-proposal prompt for a new track
 *   2. A batch-write prompt to generate all lesson files after approval
 *
 * This enforces the two-step (plan → write) workflow from LESSON_AUTHORING.md §9.
 *
 * Usage:
 *   npm run lessons:plan -- --track="Taxes 101" --slug=taxes-101 --lessons=6 --audience=beginner
 *   npm run lessons:plan -- --track="Insurance Basics" --slug=insurance --lessons=5 --calculators=none
 *
 * Output is written to ./plans/<slug>-plan.md and ./plans/<slug>-write.md for you to copy into Claude Code.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > -1) args[a.slice(2, eq)] = a.slice(eq + 1);
      else {
        args[a.slice(2)] = argv[i + 1] ?? '';
        i++;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const required = ['track', 'slug', 'lessons'];
for (const key of required) {
  if (!args[key]) {
    console.error(`Missing --${key}`);
    console.error(
      'Usage: npm run lessons:plan -- --track="Track Name" --slug=track-slug --lessons=6 [--audience=beginner] [--calculators=auto|none]'
    );
    process.exit(1);
  }
}

const trackName = args.track;
const trackSlug = args.slug;
const lessonCount = parseInt(args.lessons, 10);
const audience = args.audience ?? 'beginner';
const calculators = args.calculators ?? 'auto';

const plansDir = path.join(ROOT, 'plans');
fs.mkdirSync(plansDir, { recursive: true });

// -- Prompt 1: curriculum proposal -------------------------------------------

const planPrompt = `# Claude Code Prompt — Curriculum Proposal for "${trackName}"

Copy the block below into Claude Code. Review and edit the output before proceeding to the write phase.

---

Read LESSON_AUTHORING.md.

Propose a curriculum for a new track:

- **Track name:** ${trackName}
- **Track slug:** ${trackSlug}
- **Target audience:** ${audience} (ages 16–30, ${audience === 'beginner' ? 'no prior financial knowledge assumed' : 'some financial literacy basics assumed'})
- **Number of lessons:** ${lessonCount}
- **Calculator usage:** ${calculators === 'none' ? 'this track does not require calculator embeds' : 'recommend calculator embeds where they naturally reinforce the concept'}

For each lesson, output:

1. **Order** (1-indexed position in the track)
2. **Title** (title case, concrete, not clickbait)
3. **One-sentence description** (under 140 characters; hook, not summary)
4. **Estimated minutes** (5–10)
5. **Core concept** (one sentence: what the reader will understand after reading)
6. **3 concrete examples you plan to use** (dollar amounts, real scenarios)
7. **Calculator to embed** (one of: CompoundInterestCalc, DebtPayoffCalc, BudgetBuilderCalc, TaxBracketCalc, CreditCardTrapCalc, or "none — no calculator fits naturally")
8. **New glossary terms introduced** (list any terms this lesson will define for the first time)

Additional requirements:
- The curriculum must have a clear arc: early lessons establish foundations that later lessons build on.
- No two lessons should cover overlapping core concepts.
- The first lesson must be approachable for a total beginner.
- The final lesson should leave the reader with something actionable.

Output the full proposal as a single markdown table plus a short narrative (2–3 sentences) explaining the arc of the track.

**Do not write any lesson content yet.** I will review and edit this proposal before you write the lessons.
`;

const planPath = path.join(plansDir, `${trackSlug}-plan.md`);
fs.writeFileSync(planPath, planPrompt, 'utf8');

// -- Prompt 2: batch write ---------------------------------------------------

const writePrompt = `# Claude Code Prompt — Batch Write for "${trackName}"

Use this prompt **after** you have reviewed and finalized the curriculum proposal from ${trackSlug}-plan.md.

Copy the block below into Claude Code.

---

Read LESSON_AUTHORING.md.

I have approved the following curriculum for a new track. Write all ${lessonCount} lessons now.

**Track:** ${trackName}
**Slug:** ${trackSlug}

**Approved curriculum:**

<!-- PASTE THE APPROVED CURRICULUM TABLE HERE BEFORE RUNNING THIS PROMPT -->

Tasks:

1. Register the new track in \`/src/lib/data/tracks.ts\` with:
   - slug: \`${trackSlug}\`
   - title: \`${trackName}\`
   - description: write a one-sentence track description under 140 characters
   - icon: pick an appropriate lucide-svelte icon name
   - accent: pick one of 'emerald', 'amber', or 'blue'
   - lessons: the array of ${lessonCount} lessons per the approved curriculum

2. Create the folder \`/src/lib/content/lessons/${trackSlug}/\` if it doesn't exist.

3. For each of the ${lessonCount} lessons, create a \`.svx\` file named \`NN-slug.svx\` where NN is the zero-padded order. Each lesson must:
   - Include complete frontmatter per LESSON_AUTHORING.md §5
   - Follow the structural requirements in §3
   - Match the gold-standard reference lesson in §6 for tone, depth, and pacing
   - Be 500–700 words of body prose
   - Pass every check in the §8 pre-commit checklist

4. For every new glossary term introduced, add it to \`/src/lib/data/glossary.ts\`. Each entry must include:
   - \`term\`: the term name (case-sensitive as it appears in lessons)
   - \`definition\`: plain-language definition, 1–2 sentences
   - \`lessonSlug\` (optional): the lesson where the term is primarily taught

5. After writing all files, run \`npm run lessons:validate\`. If any lesson fails validation, fix it and re-run until all pass.

6. Report back with:
   - A list of the files you created
   - Any glossary terms added
   - The validator output (expect: all green)

**Constraints (violations = failure):**
- No lorem ipsum, no placeholders, no \"TODO\" strings anywhere
- Every lesson embeds at least one \`<TryItYourself>\` with a relevant calculator OR, if the approved curriculum said "none," embeds a \`<TryItYourself>\` with an interactive element that makes sense for the concept
- Every lesson has exactly one correct \`QuickQuiz\` answer
- Every lesson has 3–5 \`KeyTakeaways\` points
- Second person voice throughout
- No banned phrases (see §2 of the authoring guide)

Begin.
`;

const writePath = path.join(plansDir, `${trackSlug}-write.md`);
fs.writeFileSync(writePath, writePrompt, 'utf8');

// -- Output ------------------------------------------------------------------

console.log(`✓ Created two prompts for track "${trackName}":`);
console.log('');
console.log(`  1. ${path.relative(ROOT, planPath)}`);
console.log('     → Paste this into Claude Code to generate the curriculum proposal');
console.log('');
console.log(`  2. ${path.relative(ROOT, writePath)}`);
console.log('     → After you approve the curriculum, paste the approved table into');
console.log('       this file where indicated, then run the updated prompt in Claude Code');
console.log('');
console.log('Workflow:');
console.log('  Step 1: cat ' + path.relative(ROOT, planPath) + ' | pbcopy  (or copy manually)');
console.log('  Step 2: Run in Claude Code → review output → edit the curriculum');
console.log('  Step 3: Paste the approved curriculum into the write prompt file');
console.log('  Step 4: Run the updated write prompt in Claude Code');
console.log('  Step 5: npm run lessons:validate');
