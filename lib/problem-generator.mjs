// Shared problem-note generation logic used by BOTH the CLI
// (scripts/new-problem.mjs) and the frontend "Add Problem" server action.
//
// This module is intentionally framework-agnostic and side-effect free except
// for `createProblemNote`, which writes a single file inside content/problems.

import fs from "node:fs";
import path from "node:path";
import {
  serializeFrontmatter,
  serializeProblemMarkdown,
  parseProblemMarkdown,
} from "./problem-markdown.mjs";

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

/** Error thrown when a note to edit/delete does not exist. */
export class NoteNotFoundError extends Error {
  constructor(relativePath) {
    super("This note no longer exists.");
    this.name = "NoteNotFoundError";
    this.code = "NOTE_NOT_FOUND";
    this.relativePath = relativePath;
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

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";
const LEETCODE_ALL_PROBLEMS = "https://leetcode.com/api/problems/all/";

async function fetchJson(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Resolve a LeetCode frontend problem number (e.g. 78) to its title slug.
async function resolveSlugFromNumber(number) {
  const data = await fetchJson(LEETCODE_ALL_PROBLEMS, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  });
  const pairs = data?.stat_status_pairs;
  if (!Array.isArray(pairs)) return null;
  const match = pairs.find((p) => p?.stat?.frontend_question_id === number);
  return match?.stat?.question__title_slug ?? null;
}

/**
 * Fetch lightweight LeetCode metadata (NOT the problem statement) for a number,
 * slug, or URL. Returns { questionFrontendId, title, titleSlug, difficulty,
 * topicTags } or null if it can't be resolved (offline, blocked, not found).
 */
export async function fetchLeetCodeMetadata(input) {
  let slug;
  let number = null;
  try {
    ({ slug, number } = parseInput(input));
  } catch {
    return null;
  }

  if (!slug && number != null) {
    slug = await resolveSlugFromNumber(number);
  }
  if (!slug) return null;

  const query = `
    query getQuestionMeta($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        title
        titleSlug
        difficulty
        topicTags { name slug }
      }
    }`;

  const data = await fetchJson(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables: { titleSlug: slug } }),
  });

  const q = data?.data?.question;
  if (!q?.titleSlug) return null;

  return {
    questionFrontendId: Number(q.questionFrontendId) || null,
    title: q.title,
    titleSlug: q.titleSlug,
    difficulty: q.difficulty || "Unknown",
    topicTags: Array.isArray(q.topicTags) ? q.topicTags : [],
  };
}

// Infer a default DSA pattern from LeetCode topic tags. Returns null if none match.
export function inferPattern(topicTags) {
  const names = new Set((topicTags ?? []).map((t) => t?.name));
  const has = (name) => names.has(name);

  if (has("Backtracking")) return "Backtracking";
  if (has("Array") && has("Hash Table")) return "Arrays & Hashing";
  if (has("Two Pointers")) return "Two Pointers";
  if (has("Sliding Window")) return "Sliding Window";
  if (has("Binary Search")) return "Binary Search";
  if (has("Stack")) return "Stack";
  if (has("Linked List")) return "Linked List";
  if (has("Tree") || has("Binary Tree")) return "Trees";
  if (has("Graph") || has("Breadth-First Search") || has("Depth-First Search")) {
    return "Graphs";
  }
  if (has("Dynamic Programming")) return "Dynamic Programming";
  if (has("Heap (Priority Queue)")) return "Heap / Priority Queue";
  if (has("Greedy")) return "Greedy";
  if (has("Intervals")) return "Intervals";
  return null;
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

// Honest starter template for a problem we have real metadata for but no
// curated registry entry. Uses metadata only — never the problem statement.
function buildMetadataBody(meta, pattern) {
  const patternLine = pattern ?? TODO("Which DSA pattern this belongs to");
  const whenToUse = pattern
    ? `Reach for the **${pattern}** pattern when a new problem has the same shape.`
    : TODO("Signals/triggers that should remind you to reach for this pattern");

  return `# ${meta.title}

## Core Idea
Review the problem constraints and identify the repeating decision/pattern.

## Pattern
${patternLine}

## My First Approach
${TODO("How you first tried to solve it")}

## Issue With My First Approach
${TODO("What was slow, wrong, or clunky about your first attempt")}

## Improved / Standard Approach
Add after solving or reviewing.

## Key Code
\`\`\`

\`\`\`

## Why It Works
Add explanation after solving.

## Complexity
- **Time:** _TBD_
- **Space:** _TBD_

## What I Learned
${TODO("The insight you want to remember")}

## When To Use This Pattern Again
${whenToUse}

## Similar Problems
${TODO("Related problems to revisit")}
`;
}

/**
 * Build the note (frontmatter + body) for the given input WITHOUT writing it.
 * Resolution order: local registry → live LeetCode metadata → blank template.
 * Returns { meta, contents, fromRegistry, source }.
 *
 * options: { dateSolved?, pattern?, difficulty?, rootDir?, fetchMetadata? }
 */
export async function buildProblemNote(input, options = {}) {
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
    const metadata =
      options.fetchMetadata === false
        ? null
        : await fetchLeetCodeMetadata(input);

    if (metadata) {
      const pattern = inferPattern(metadata.topicTags);
      meta = {
        title: metadata.title,
        slug: metadata.titleSlug,
        leetcodeNumber: metadata.questionFrontendId ?? hints.number ?? null,
        difficulty: metadata.difficulty ?? "Unknown",
        pattern: pattern ?? "Uncategorized",
        leetcodeUrl: `https://leetcode.com/problems/${metadata.titleSlug}/`,
        dateSolved,
        tags: metadata.topicTags.map((t) => t.slug).filter(Boolean),
        source: "leetcode-metadata",
        status: "needs-personal-notes",
      };
      body = buildMetadataBody(meta, pattern);
    } else {
      const slug =
        hints.slug ?? (hints.number != null ? `problem-${hints.number}` : null);
      if (!slug) {
        throw new InvalidInputError(
          `Could not determine a slug from input: ${input}`
        );
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
  }

  // Apply optional overrides from the caller (frontend form / CLI flags).
  if (options.pattern && options.pattern.trim()) {
    meta.pattern = options.pattern.trim();
  }
  if (options.difficulty && options.difficulty.trim()) {
    meta.difficulty = options.difficulty.trim();
  }

  const contents = `${serializeFrontmatter(meta)}\n\n${body}`;
  return {
    meta,
    contents,
    fromRegistry: Boolean(entry),
    source: meta.source,
  };
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
export async function createProblemNote(input, options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const { meta, contents, fromRegistry } = await buildProblemNote(input, {
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

/**
 * Read and parse an existing note by slug into { frontmatter, title, sections }.
 * Throws NoteNotFoundError if the file is missing.
 */
export function readProblemNote(slug, options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const { filePath } = resolveNotePath(slug, rootDir);
  if (!fs.existsSync(filePath)) {
    throw new NoteNotFoundError(path.relative(rootDir, filePath));
  }
  const raw = fs.readFileSync(filePath, "utf8");
  return parseProblemMarkdown(raw);
}

/**
 * Overwrite an existing note's file from { frontmatter, sections }. Only touches
 * the markdown file inside content/problems (never the registry).
 * Throws NoteNotFoundError if the note does not exist.
 */
export function updateProblemNote(slug, parsed, options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const { filePath } = resolveNotePath(slug, rootDir);
  const relativePath = path.relative(rootDir, filePath);
  if (!fs.existsSync(filePath)) {
    throw new NoteNotFoundError(relativePath);
  }
  fs.writeFileSync(filePath, serializeProblemMarkdown(parsed), "utf8");
  return { slug: slugify(slug), relativePath };
}

/**
 * Delete a note's markdown file by slug. Path-safe (content/problems only).
 * Throws NoteNotFoundError if the note does not exist.
 */
export function deleteProblemNote(slug, options = {}) {
  const rootDir = options.rootDir ?? process.cwd();
  const { filePath } = resolveNotePath(slug, rootDir);
  const relativePath = path.relative(rootDir, filePath);
  if (!fs.existsSync(filePath)) {
    throw new NoteNotFoundError(relativePath);
  }
  fs.unlinkSync(filePath);
  return { slug: slugify(slug), relativePath };
}
