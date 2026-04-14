#!/usr/bin/env node
/**
 * scripts/validate-lessons.ts
 *
 * Validates every .svx lesson against the authoring guide.
 * Fails the build if any lesson doesn't conform.
 *
 * Usage:
 *   npm run lessons:validate
 *   npm run lessons:validate -- --fix-warnings  (prints suggested edits)
 *   npm run lessons:validate -- --lesson=path/to/file.svx
 *
 * Exit codes:
 *   0 — all lessons pass
 *   1 — one or more lessons have errors
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const LESSONS_ROOT = path.join(ROOT, 'src/lib/content/lessons');
const TRACKS_PATH = path.join(ROOT, 'src/lib/data/tracks.ts');
const GLOSSARY_PATH = path.join(ROOT, 'src/lib/data/glossary.ts');

// -- Config ------------------------------------------------------------------

const WORD_COUNT_MIN = 500;
const WORD_COUNT_MAX = 700;
const WORD_COUNT_HARD_MIN = 350; // below this = error, between this and MIN = warning
const WORD_COUNT_HARD_MAX = 900;

const REQUIRED_FRONTMATTER = [
  'title',
  'description',
  'estimatedMinutes',
  'track',
  'order',
  'tags',
  'glossaryTerms'
];

const REQUIRED_COMPONENTS = ['TryItYourself', 'KeyTakeaways', 'QuickQuiz'];

const BANNED_PHRASES = [
  'in today\'s economy',
  'at the end of the day',
  'it goes without saying',
  'lorem ipsum',
  'TODO',
  'placeholder'
];

// -- Arg parsing -------------------------------------------------------------

const argv = process.argv.slice(2);
const args: Record<string, string | boolean> = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) {
    const eq = a.indexOf('=');
    if (eq > -1) args[a.slice(2, eq)] = a.slice(eq + 1);
    else {
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[a.slice(2)] = next;
        i++;
      } else {
        args[a.slice(2)] = true;
      }
    }
  }
}

// -- Helpers -----------------------------------------------------------------

type Issue = { level: 'error' | 'warning'; msg: string };
type LessonReport = { file: string; issues: Issue[] };

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.svx')) out.push(full);
  }
  return out;
}

function parseFrontmatter(src: string): { data: Record<string, unknown>; body: string } | null {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const yamlBlock = match[1];
  const body = match[2];
  const data: Record<string, unknown> = {};
  const lines = yamlBlock.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let raw = kv[2].trim();
    // Array parsing for [a, b, c] or ["a", "b"]
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1).trim();
      if (!inner) data[key] = [];
      else
        data[key] = inner
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
    } else if (/^-?\d+$/.test(raw)) {
      data[key] = parseInt(raw, 10);
    } else {
      data[key] = raw.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body };
}

function countBodyWords(body: string): number {
  // Strip script block
  let text = body.replace(/<script[\s\S]*?<\/script>/g, '');
  // Strip HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  // Strip component blocks (multi-line self-closing or paired)
  text = text.replace(/<[A-Z][\s\S]*?\/>/g, '');
  text = text.replace(/<[A-Z][\w]*[\s\S]*?<\/[A-Z][\w]*>/g, '');
  // Strip markdown syntax chars
  text = text.replace(/[#*_`>\-]/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').length;
}

function loadTrackSlugs(): Set<string> {
  if (!fs.existsSync(TRACKS_PATH)) return new Set();
  const src = fs.readFileSync(TRACKS_PATH, 'utf8');
  const slugs = new Set<string>();
  const re = /slug:\s*['"]([\w-]+)['"]/g;
  let m;
  while ((m = re.exec(src))) slugs.add(m[1]);
  return slugs;
}

function loadGlossaryTerms(): Set<string> {
  if (!fs.existsSync(GLOSSARY_PATH)) return new Set();
  const src = fs.readFileSync(GLOSSARY_PATH, 'utf8');
  const terms = new Set<string>();
  const re = /term:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) terms.add(m[1].toLowerCase());
  return terms;
}

// -- Validators --------------------------------------------------------------

function validateLesson(
  file: string,
  trackSlugs: Set<string>,
  glossaryTerms: Set<string>
): LessonReport {
  const issues: Issue[] = [];
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  const parsed = parseFrontmatter(src);
  if (!parsed) {
    issues.push({ level: 'error', msg: 'Missing or malformed frontmatter block' });
    return { file: rel, issues };
  }

  const { data, body } = parsed;

  // Required frontmatter fields
  for (const field of REQUIRED_FRONTMATTER) {
    if (data[field] === undefined || data[field] === '') {
      issues.push({ level: 'error', msg: `Missing frontmatter field: ${field}` });
    }
  }

  // Description length
  if (typeof data.description === 'string' && data.description.length > 140) {
    issues.push({
      level: 'warning',
      msg: `description is ${data.description.length} chars (soft max 140)`
    });
  }
  if (typeof data.description === 'string' && data.description.toUpperCase().includes('TODO')) {
    issues.push({ level: 'error', msg: 'description still contains TODO' });
  }

  // Track exists
  if (typeof data.track === 'string' && !trackSlugs.has(data.track)) {
    issues.push({
      level: 'error',
      msg: `track "${data.track}" not found in tracks.ts (found: ${[...trackSlugs].join(', ') || 'none'})`
    });
  }

  // Filename matches order + slug
  const fname = path.basename(file);
  if (typeof data.order === 'number') {
    const expectedPrefix = `${data.order.toString().padStart(2, '0')}-`;
    if (!fname.startsWith(expectedPrefix)) {
      issues.push({
        level: 'error',
        msg: `filename "${fname}" should start with "${expectedPrefix}" to match order ${data.order}`
      });
    }
  }

  // Word count
  const words = countBodyWords(body);
  if (words < WORD_COUNT_HARD_MIN) {
    issues.push({ level: 'error', msg: `body is ${words} words (hard min ${WORD_COUNT_HARD_MIN})` });
  } else if (words < WORD_COUNT_MIN) {
    issues.push({
      level: 'warning',
      msg: `body is ${words} words (target ${WORD_COUNT_MIN}–${WORD_COUNT_MAX})`
    });
  } else if (words > WORD_COUNT_HARD_MAX) {
    issues.push({ level: 'error', msg: `body is ${words} words (hard max ${WORD_COUNT_HARD_MAX})` });
  } else if (words > WORD_COUNT_MAX) {
    issues.push({
      level: 'warning',
      msg: `body is ${words} words (target ${WORD_COUNT_MIN}–${WORD_COUNT_MAX})`
    });
  }

  // Required components
  for (const comp of REQUIRED_COMPONENTS) {
    if (!body.includes(`<${comp}`)) {
      issues.push({ level: 'error', msg: `missing required component: <${comp}>` });
    }
  }

  // The Big Idea heading
  if (!/^##\s+The Big Idea/m.test(body)) {
    issues.push({ level: 'error', msg: 'missing "## The Big Idea" section' });
  }

  // Body section count (## headings, excluding script/comments)
  const headingMatches = body.match(/^##\s+.+$/gm) ?? [];
  if (headingMatches.length < 3) {
    issues.push({
      level: 'warning',
      msg: `only ${headingMatches.length} ## sections (target ≥3: Big Idea + 2 body sections minimum)`
    });
  }

  // Banned phrases
  const lowerBody = body.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lowerBody.includes(phrase.toLowerCase())) {
      issues.push({ level: 'error', msg: `contains banned/stub phrase: "${phrase}"` });
    }
  }

  // Exclamation point count (soft cap 1 per lesson)
  const exclaims = (body.match(/!/g) ?? []).length;
  if (exclaims > 2) {
    issues.push({ level: 'warning', msg: `${exclaims} exclamation points (soft max 1)` });
  }

  // Second-person check — presence of "you" somewhere in body
  if (!/\byou\b/i.test(body)) {
    issues.push({ level: 'error', msg: 'no second-person "you" detected — check voice' });
  }

  // Glossary terms exist
  if (Array.isArray(data.glossaryTerms)) {
    for (const term of data.glossaryTerms as string[]) {
      if (!glossaryTerms.has(term.toLowerCase())) {
        issues.push({
          level: 'warning',
          msg: `glossaryTerm "${term}" not found in glossary.ts — add it`
        });
      }
    }
  }

  // QuickQuiz: exactly one correct answer
  const quizBlock = body.match(/<QuickQuiz[\s\S]*?\/>/);
  if (quizBlock) {
    const correctCount = (quizBlock[0].match(/correct:\s*true/g) ?? []).length;
    if (correctCount !== 1) {
      issues.push({
        level: 'error',
        msg: `<QuickQuiz> has ${correctCount} correct answers (must be exactly 1)`
      });
    }
    const optionCount = (quizBlock[0].match(/\{\s*text:/g) ?? []).length;
    if (optionCount < 3 || optionCount > 5) {
      issues.push({
        level: 'warning',
        msg: `<QuickQuiz> has ${optionCount} options (recommend 4)`
      });
    }
  }

  // KeyTakeaways: 3–5 points
  const ktBlock = body.match(/<KeyTakeaways[\s\S]*?\/>/);
  if (ktBlock) {
    const points = (ktBlock[0].match(/"[^"]+"/g) ?? []).length;
    if (points < 3 || points > 5) {
      issues.push({
        level: 'warning',
        msg: `<KeyTakeaways> has ${points} points (target 3–5)`
      });
    }
  }

  return { file: rel, issues };
}

// -- Cross-lesson validation -------------------------------------------------

function validateCrossLesson(reports: LessonReport[], allLessons: Array<{ file: string; data: Record<string, unknown> }>): Issue[] {
  const issues: Issue[] = [];
  const byTrack: Record<string, Array<{ file: string; order: number }>> = {};
  for (const { file, data } of allLessons) {
    if (typeof data.track === 'string' && typeof data.order === 'number') {
      byTrack[data.track] ??= [];
      byTrack[data.track].push({ file, order: data.order });
    }
  }
  for (const [track, lessons] of Object.entries(byTrack)) {
    const seen = new Map<number, string>();
    for (const l of lessons) {
      if (seen.has(l.order)) {
        issues.push({
          level: 'error',
          msg: `order collision in "${track}": ${seen.get(l.order)} and ${l.file} both use order ${l.order}`
        });
      }
      seen.set(l.order, l.file);
    }
  }
  return issues;
}

// -- Main --------------------------------------------------------------------

const trackSlugs = loadTrackSlugs();
const glossaryTerms = loadGlossaryTerms();

let files: string[];
if (typeof args.lesson === 'string') {
  files = [path.resolve(ROOT, args.lesson)];
} else {
  files = walk(LESSONS_ROOT);
}

if (files.length === 0) {
  console.log('No lessons found. (This is fine if you haven\'t written any yet.)');
  process.exit(0);
}

const reports: LessonReport[] = [];
const allLessons: Array<{ file: string; data: Record<string, unknown> }> = [];

for (const file of files) {
  const report = validateLesson(file, trackSlugs, glossaryTerms);
  reports.push(report);
  const src = fs.readFileSync(file, 'utf8');
  const parsed = parseFrontmatter(src);
  if (parsed) allLessons.push({ file: path.relative(ROOT, file), data: parsed.data });
}

const crossIssues = validateCrossLesson(reports, allLessons);

// -- Output ------------------------------------------------------------------

let errorCount = 0;
let warningCount = 0;

for (const r of reports) {
  if (r.issues.length === 0) {
    console.log(`✓ ${r.file}`);
    continue;
  }
  console.log(`\n${r.file}`);
  for (const issue of r.issues) {
    const icon = issue.level === 'error' ? '✗' : '⚠';
    console.log(`  ${icon} [${issue.level}] ${issue.msg}`);
    if (issue.level === 'error') errorCount++;
    else warningCount++;
  }
}

if (crossIssues.length) {
  console.log('\nCross-lesson checks:');
  for (const issue of crossIssues) {
    const icon = issue.level === 'error' ? '✗' : '⚠';
    console.log(`  ${icon} [${issue.level}] ${issue.msg}`);
    if (issue.level === 'error') errorCount++;
    else warningCount++;
  }
}

console.log(`\n${reports.length} lesson(s) checked — ${errorCount} error(s), ${warningCount} warning(s)`);

process.exit(errorCount > 0 ? 1 : 0);
