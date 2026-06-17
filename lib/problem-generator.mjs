// Shared problem-note generation logic used by BOTH the CLI
// (scripts/new-problem.mjs) and the frontend "Add Problem" server action.
//
// This module is intentionally framework-agnostic and side-effect free except
// for `createProblemNote`, which writes a single file inside content/problems.

import fs from "node:fs";
import path from "node:path";

export const CONTENT_SUBDIR = path.join("content", "problems");
export const REGISTRY_SUBPATH = path.join("content", "problem-registry.json");

/** Error thrown when a note already exists and overwrite was not requested. */
export class NoteExistsError extends Error {
  constructor(relativePath) {
    super("This note already exists.");
    this.name = "NoteExistsError";
    this.code = "NOTE_EXISTS";
    this.relativePath = relativePath;
  }
}

/** Error thrown for unusable input or an unsafe target path. */
export class InvalidInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidInputError";
    this.code = "INVALID_INPUT";
  }
}

const TODO = (label) =>
  `<!-- ${label} (personal note) — not added yet. Replace this comment with your own words. -->`;

export function todayLocalISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Tokens that should keep a specific casing instead of plain capitalization.
const ACRONYMS = new Map([
  ["lru", "LRU"],
  ["bfs", "BFS"],
  ["dfs", "DFS"],
  ["dp", "DP"],
  ["sql", "SQL"],
  ["kth", "Kth"],
  ["3sum", "3Sum"],
  ["4sum", "4Sum"],
]);

// Minor words kept lowercase in titles (unless they are the first word).
const SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on",
  "or", "the", "to", "up", "via", "with",
]);

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Turn a slug into a nicely cased title, e.g. "lru-cache" -> "LRU Cache".
export function slugToTitle(slug) {
  const words = String(slug).split("-").filter(Boolean);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return ACRONYMS.get(lower);
      // Leading-number tokens, e.g. "3sum" -> "3Sum", "2pointers" -> "2Pointers".
      const numMatch = lower.match(/^(\d+)([a-z].*)$/);
      if (numMatch) return `${numMatch[1]}${capitalize(numMatch[2])}`;
      if (index !== 0 && SMALL_WORDS.has(lower)) return lower;
      return capitalize(lower);
    })
    .join(" ");
}

export function loadRegistry(rootDir = process.cwd()) {
  try {
    return JSON.parse(fs.readFileSync(path.join(rootDir, REGISTRY_SUBPATH), "utf8"));
  } catch {
    return {};
  }
}

// Resolve raw input (URL, number, slug, or title) into { slug, number } hints.
export function parseInput(raw) {
  const value = String(raw ?? "").trim();
  if (!value) throw new InvalidInputError("Provide a problem number, slug, title, or LeetCode URL.");

  if (/^https?:\/\//i.test(value)) {
    const match = value.match(/problems\/([^/?#]+)/i);
    if (!match) throw new InvalidInputError(`Could not extract a slug from URL: ${value}`);
    return { slug: slugify(match[1]), number: null };
  }
  if (/^\d+$/.test(value)) {
    return { slug: null, number: Number.parseInt(value, 10) };
  }
  return { slug: slugify(value), number: null };
}

export function findEntry(registry, { slug, number }) {
  const entries = Object.values(registry);
  if (number != null) {
    const byNumber = entries.find((e) => e.leetcodeNumber === number);
    if (byNumber) return byNumber;
  }
  if (slug) {
    const bySlug = registry[slug] ?? entries.find((e) => e.slug === slug);
    if (bySlug) return bySlug;
    const byTitle = entries.find((e) => slugify(e.title) === slug);
    if (byTitle) return byTitle;
  }
  return null;
}

function quote(value) {
  return JSON.stringify(value ?? "");
}

function buildFrontmatter(meta) {
  const lines = ["---"];
  lines.push(`title: ${quote(meta.title)}`);
  lines.push(`slug: ${quote(meta.slug)}`);
  lines.push(
    `leetcodeNumber: ${meta.leetcodeNumber == null ? "null" : meta.leetcodeNumber}`
  );
  lines.push(`difficulty: ${quote(meta.difficulty)}`);
  lines.push(`pattern: ${quote(meta.pattern)}`);
  lines.push(`leetcodeUrl: ${meta.leetcodeUrl ? quote(meta.leetcodeUrl) : "null"}`);
  lines.push(`dateSolved: ${quote(meta.dateSolved)}`);
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  lines.push(`tags: [${tags.map((t) => quote(t)).join(", ")}]`);
  lines.push(`source: ${quote(meta.source)}`);
  lines.push(`status: ${quote(meta.status)}`);
  lines.push("---");
  return lines.join("\n");
}

function buildKnownBody(meta, starter) {
  const lang = starter.language ?? "";
  const code = starter.keyCode ?? "";
  const similar = Array.isArray(starter.similarProblems)
    ? starter.similarProblems.map((p) => `- ${p}`).join("\n")
    : TODO("Similar problems");

  const complexity =
    starter.timeComplexity || starter.spaceComplexity
      ? `- **Time:** ${starter.timeComplexity ?? "—"}\n- **Space:** ${
          starter.spaceComplexity ?? "—"
        }`
      : TODO("Time and space complexity");

  return `# ${meta.title}

## Core Idea
${starter.coreIdea ?? TODO("Core idea")}

## Pattern
${starter.pattern ?? TODO("Pattern")}

## My First Approach
${TODO("How you first tried to solve it")}

## Issue With My First Approach
${TODO("What was slow, wrong, or clunky about your first attempt")}

## Improved / Standard Approach
${starter.standardApproach ?? TODO("The cleaner / standard approach")}

## Key Code
\`\`\`${lang}
${code}
\`\`\`

## Why It Works
${starter.whyItWorks ?? TODO("Why the approach is correct")}

## Complexity
${complexity}

## What I Learned
${TODO("The insight you want to remember")}

## When To Use This Pattern Again
${TODO("Signals/triggers that should remind you to reach for this pattern")}

## Similar Problems
${similar}
`;
}

function buildBlankBody(meta) {
  return `# ${meta.title}

## Core Idea
${TODO("Core idea")}

## Pattern
${TODO("Which DSA pattern this belongs to")}

## My First Approach
${TODO("How you first tried to solve it")}

## Issue With My First Approach
${TODO("What was slow, wrong, or clunky about your first attempt")}

## Improved / Standard Approach
${TODO("The cleaner / standard approach")}

## Key Code
\`\`\`
${"// TODO: add your solution"}
\`\`\`

## Why It Works
${TODO("Why the approach is correct")}

## Complexity
${TODO("Time and space complexity")}

## What I Learned
${TODO("The insight you want to remember")}

## When To Use This Pattern Again
${TODO("Signals/triggers that should remind you to reach for this pattern")}

## Similar Problems
${TODO("Related problems to revisit")}
`;
}

/**
 * Build the note (frontmatter + body) for the given input WITHOUT writing it.
 * Returns { meta, contents, fromRegistry }.
 *
 * options: { dateSolved?, pattern?, difficulty?, rootDir? }
 */
export function buildProblemNote(input, options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const registry = loadRegistry(rootDir);
  const hints = parseInput(input);
  const entry = findEntry(registry, hints);

  let meta;
  let body;
  const dateSolved = options.dateSolved?.trim() || todayLocalISO();

  if (entry) {
    const slug = entry.slug ?? slugify(entry.title);
    meta = {
      title: entry.title,
      slug,
      leetcodeNumber: entry.leetcodeNumber ?? null,
      difficulty: entry.difficulty ?? "Easy",
      pattern: entry.pattern ?? "Uncategorized",
      leetcodeUrl:
        entry.leetcodeUrl ?? `https://leetcode.com/problems/${slug}/`,
      dateSolved,
      tags: entry.tags ?? [],
      source: "generated-starter",
      status: "needs-personal-notes",
    };
    body = buildKnownBody(meta, entry.starter ?? {});
  } else {
    const slug =
      hints.slug ?? (hints.number != null ? `problem-${hints.number}` : null);
    if (!slug) {
      throw new InvalidInputError(`Could not determine a slug from input: ${input}`);
    }
    meta = {
      title: hints.slug ? slugToTitle(hints.slug) : `Problem ${hints.number}`,
      slug,
      leetcodeNumber: hints.number ?? null,
      difficulty: "Unknown",
      pattern: "Uncategorized",
      leetcodeUrl: hints.slug
        ? `https://leetcode.com/problems/${hints.slug}/`
        : null,
      dateSolved,
      tags: [],
      source: "manual-needed",
      status: "needs-fill",
    };
    body = buildBlankBody(meta);
  }

  // Apply optional overrides from the caller (frontend form / CLI flags).
  if (options.pattern && options.pattern.trim()) {
    meta.pattern = options.pattern.trim();
  }
  if (options.difficulty && options.difficulty.trim()) {
    meta.difficulty = options.difficulty.trim();
  }

  const contents = `${buildFrontmatter(meta)}\n\n${body}`;
  return { meta, contents, fromRegistry: Boolean(entry) };
}

/**
 * Resolve the absolute, validated path for a note slug. Throws if the slug is
 * unusable or would escape the content/problems directory (path traversal).
 */
export function resolveNotePath(slug, rootDir = process.cwd()) {
  const safeSlug = slugify(slug);
  if (!safeSlug) throw new InvalidInputError("Resolved slug is empty.");

  const problemsDir = path.resolve(rootDir, CONTENT_SUBDIR);
  const filePath = path.resolve(problemsDir, `${safeSlug}.md`);

  // Guarantee the final path stays directly inside content/problems.
  const expected = path.join(problemsDir, `${safeSlug}.md`);
  if (filePath !== expected || path.dirname(filePath) !== problemsDir) {
    throw new InvalidInputError("Unsafe note path.");
  }

  return { safeSlug, filePath, problemsDir };
}

/**
 * Build and write a problem note. Returns
 * { slug, relativePath, fromRegistry, overwritten, meta }.
 *
 * options: { force?, dateSolved?, pattern?, difficulty?, rootDir? }
 * Throws NoteExistsError when the file exists and force is not set.
 */
export function createProblemNote(input, options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const { meta, contents, fromRegistry } = buildProblemNote(input, {
    ...options,
    rootDir,
  });

  const { filePath, problemsDir } = resolveNotePath(meta.slug, rootDir);
  const relativePath = path.relative(rootDir, filePath);

  const exists = fs.existsSync(filePath);
  if (exists && !options.force) {
    throw new NoteExistsError(relativePath);
  }

  fs.mkdirSync(problemsDir, { recursive: true });
  fs.writeFileSync(filePath, contents, "utf8");

  return {
    slug: meta.slug,
    relativePath,
    fromRegistry,
    overwritten: exists,
    meta,
  };
}
