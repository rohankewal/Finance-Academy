#!/usr/bin/env node
/**
 * scripts/audit-lessons.ts
 *
 * Analyzes all lessons for consistency, quality drift, and improvement opportunities.
 * Unlike validate-lessons.ts (which enforces hard rules), this script surfaces soft signals
 * you'd want to know about monthly: lessons that are outliers in length, reading level,
 * or missing signals, and produces a prioritized rewrite list.
 *
 * Usage:
 *   npm run lessons:audit
 *   npm run lessons:audit -- --json  (machine-readable output for piping into Claude Code)
 *
 * Typical workflow:
 *   Run this monthly. Feed the output to Claude Code with:
 *   "Read LESSON_AUTHORING.md and the audit report below. Rewrite the flagged lessons."
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const LESSONS_ROOT = path.join(ROOT, 'src/lib/content/lessons');

const argv = process.argv.slice(2);
const jsonMode = argv.includes('--json');

// -- Helpers (duplicated from validate for standalone use) -------------------

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

function parseFrontmatter(src: string) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const data: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let raw = kv[2].trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1).trim();
      data[key] = inner ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')) : [];
    } else if (/^-?\d+$/.test(raw)) {
      data[key] = parseInt(raw, 10);
    } else {
      data[key] = raw.replace(/^["']|["']$/g, '');
    }
  }
  return { data, body: match[2] };
}

function cleanBody(body: string): string {
  let t = body.replace(/<script[\s\S]*?<\/script>/g, '');
  t = t.replace(/<!--[\s\S]*?-->/g, '');
  t = t.replace(/<[A-Z][\s\S]*?\/>/g, '');
  t = t.replace(/<[A-Z][\w]*[\s\S]*?<\/[A-Z][\w]*>/g, '');
  return t;
}

function wordCount(text: string): number {
  const t = text.replace(/[#*_`>\-]/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t.split(' ').length : 0;
}

function sentenceCount(text: string): number {
  return (text.match(/[.!?]+(?=\s|$)/g) ?? []).length || 1;
}

function syllableCount(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Flesch-Kincaid Grade Level.
 * Target for Finance Academy: 7–10. Higher = harder to read.
 */
function fleschKincaidGrade(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = sentenceCount(text);
  const syllables = words.reduce((sum, w) => sum + syllableCount(w), 0);
  if (words.length === 0 || sentences === 0) return 0;
  return 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59;
}

function avgSentenceLength(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = sentenceCount(text);
  return words / sentences;
}

function secondPersonDensity(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  const youCount = (text.match(/\b(you|your|you're|you've|you'll|you'd)\b/gi) ?? []).length;
  return words > 0 ? (youCount / words) * 100 : 0;
}

function hasConcreteDollarExamples(text: string): boolean {
  return /\$[\d,]+/.test(text);
}

// -- Audit -------------------------------------------------------------------

type LessonMetrics = {
  file: string;
  track: string;
  title: string;
  words: number;
  grade: number;
  avgSentence: number;
  youDensity: number;
  hasDollarExamples: boolean;
  exclamations: number;
  score: number; // composite quality signal 0–100
  flags: string[];
};

function scoreLesson(m: Omit<LessonMetrics, 'score' | 'flags'>): {
  score: number;
  flags: string[];
} {
  let score = 100;
  const flags: string[] = [];

  // Word count (target 500–700)
  if (m.words < 400) {
    score -= 20;
    flags.push(`too short (${m.words} words)`);
  } else if (m.words < 500) {
    score -= 8;
    flags.push(`slightly short (${m.words} words)`);
  } else if (m.words > 800) {
    score -= 12;
    flags.push(`too long (${m.words} words)`);
  } else if (m.words > 700) {
    score -= 4;
  }

  // Reading grade (target 7–10)
  if (m.grade > 12) {
    score -= 18;
    flags.push(`reading level too high (grade ${m.grade.toFixed(1)})`);
  } else if (m.grade > 10) {
    score -= 8;
    flags.push(`reading level a bit high (grade ${m.grade.toFixed(1)})`);
  } else if (m.grade < 6) {
    score -= 4;
    flags.push(`reading level very low (grade ${m.grade.toFixed(1)})`);
  }

  // Avg sentence length (target 12–20)
  if (m.avgSentence > 25) {
    score -= 10;
    flags.push(`sentences too long (avg ${m.avgSentence.toFixed(1)} words)`);
  } else if (m.avgSentence > 20) {
    score -= 4;
  }

  // Second-person density (target ≥ 1.0%)
  if (m.youDensity < 0.5) {
    score -= 15;
    flags.push(`low "you" usage (${m.youDensity.toFixed(2)}%) — voice may be too detached`);
  } else if (m.youDensity < 1.0) {
    score -= 6;
    flags.push(`moderate "you" usage (${m.youDensity.toFixed(2)}%)`);
  }

  // Dollar examples
  if (!m.hasDollarExamples) {
    score -= 15;
    flags.push('no concrete dollar examples detected');
  }

  // Exclamation points (soft max 1)
  if (m.exclamations > 3) {
    score -= 6;
    flags.push(`${m.exclamations} exclamation points`);
  } else if (m.exclamations > 1) {
    score -= 2;
  }

  return { score: Math.max(0, score), flags };
}

// -- Main --------------------------------------------------------------------

const files = walk(LESSONS_ROOT);
if (files.length === 0) {
  if (jsonMode) console.log(JSON.stringify({ lessons: [], summary: 'no lessons found' }));
  else console.log('No lessons found.');
  process.exit(0);
}

const metrics: LessonMetrics[] = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const parsed = parseFrontmatter(src);
  if (!parsed) continue;
  const body = cleanBody(parsed.body);
  const base = {
    file: path.relative(ROOT, file),
    track: (parsed.data.track as string) ?? 'unknown',
    title: (parsed.data.title as string) ?? path.basename(file),
    words: wordCount(body),
    grade: fleschKincaidGrade(body),
    avgSentence: avgSentenceLength(body),
    youDensity: secondPersonDensity(body),
    hasDollarExamples: hasConcreteDollarExamples(body),
    exclamations: (body.match(/!/g) ?? []).length
  };
  const { score, flags } = scoreLesson(base);
  metrics.push({ ...base, score, flags });
}

// Sort lowest-score first (highest priority to rewrite)
metrics.sort((a, b) => a.score - b.score);

const avgScore = metrics.reduce((s, m) => s + m.score, 0) / metrics.length;
const flagged = metrics.filter((m) => m.score < 80);

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        totalLessons: metrics.length,
        averageScore: Math.round(avgScore * 10) / 10,
        flaggedCount: flagged.length,
        lessons: metrics
      },
      null,
      2
    )
  );
  process.exit(0);
}

// Human-readable output
console.log(`\n━━━ Finance Academy Lesson Audit ━━━\n`);
console.log(`Total lessons: ${metrics.length}`);
console.log(`Average quality score: ${avgScore.toFixed(1)}/100`);
console.log(`Flagged for review (score < 80): ${flagged.length}`);
console.log('');

if (flagged.length === 0) {
  console.log('✓ All lessons look healthy. No rewrites recommended right now.\n');
  process.exit(0);
}

console.log(`━━━ Rewrite Priority List ━━━\n`);
for (const m of flagged) {
  console.log(`[${m.score}/100] ${m.file}`);
  console.log(`  Title: ${m.title}`);
  console.log(`  Stats: ${m.words}w · grade ${m.grade.toFixed(1)} · avg sentence ${m.avgSentence.toFixed(1)}w · "you" ${m.youDensity.toFixed(2)}%`);
  for (const flag of m.flags) console.log(`  • ${flag}`);
  console.log('');
}

console.log('━━━ Suggested Claude Code Prompt ━━━\n');
console.log('Copy the block below into Claude Code to trigger rewrites:\n');
console.log('---');
console.log('Read LESSON_AUTHORING.md. The following lessons have been flagged by the audit.');
console.log('Rewrite each one to fix the listed issues while preserving its core teaching goals.');
console.log('After rewriting, run `npm run lessons:validate` and `npm run lessons:audit` to confirm improvement.\n');
for (const m of flagged.slice(0, 5)) {
  console.log(`- ${m.file} — issues: ${m.flags.join('; ')}`);
}
console.log('---\n');
