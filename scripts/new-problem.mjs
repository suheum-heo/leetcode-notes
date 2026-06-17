#!/usr/bin/env node
// Generate a LeetCode problem note in content/problems from a number, slug,
// title, or LeetCode URL. Known problems (content/problem-registry.json) get
// starter/reference content; unknown problems get a blank, fill-me template.
//
// Usage:
//   npm run new:problem 217
//   npm run new:problem contains-duplicate
//   npm run new:problem "https://leetcode.com/problems/contains-duplicate/"
//   npm run new:problem 217 -- --force        # overwrite an existing note

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROBLEMS_DIR = path.join(ROOT, "content", "problems");
const REGISTRY_PATH = path.join(ROOT, "content", "problem-registry.json");

const TODO = (label) =>
  `<!-- ${label} (personal note) — not added yet. Replace this comment with your own words. -->`;

function fail(message) {
  console.error(`\u2717 ${message}`);
  process.exit(1);
}

function todayLocalISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slugify(input) {
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
function slugToTitle(slug) {
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

function loadRegistry() {
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
  } catch {
    return {};
  }
}

// Resolve raw CLI input into { slug, number } hints.
function parseInput(raw) {
  if (/^https?:\/\//i.test(raw)) {
    const match = raw.match(/problems\/([^/?#]+)/i);
    if (!match) fail(`Could not extract a slug from URL: ${raw}`);
    return { slug: slugify(match[1]), number: null };
  }
  if (/^\d+$/.test(raw.trim())) {
    return { slug: null, number: Number.parseInt(raw, 10) };
  }
  return { slug: slugify(raw), number: null };
}

function findEntry(registry, { slug, number }) {
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

function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force") || argv.includes("-f");
  const positional = argv.filter((a) => !a.startsWith("-"));

  if (positional.length === 0) {
    fail(
      "Provide a problem number, slug, title, or LeetCode URL.\n  e.g. npm run new:problem 217"
    );
  }

  const raw = positional.join(" ");
  const registry = loadRegistry();
  const hints = parseInput(raw);
  const entry = findEntry(registry, hints);

  let meta;
  let body;

  if (entry) {
    meta = {
      title: entry.title,
      slug: entry.slug ?? slugify(entry.title),
      leetcodeNumber: entry.leetcodeNumber ?? null,
      difficulty: entry.difficulty ?? "Easy",
      pattern: entry.pattern ?? "Uncategorized",
      leetcodeUrl:
        entry.leetcodeUrl ??
        `https://leetcode.com/problems/${entry.slug ?? slugify(entry.title)}/`,
      dateSolved: todayLocalISO(),
      tags: entry.tags ?? [],
      source: "generated-starter",
      status: "needs-personal-notes",
    };
    body = buildKnownBody(meta, entry.starter ?? {});
  } else {
    // Unknown problem: derive what we can, leave the rest to be filled in.
    const slug = hints.slug ?? (hints.number != null ? `problem-${hints.number}` : null);
    if (!slug) fail(`Could not determine a slug from input: ${raw}`);

    meta = {
      title: hints.slug ? slugToTitle(hints.slug) : `Problem ${hints.number}`,
      slug,
      leetcodeNumber: hints.number ?? null,
      difficulty: "Unknown",
      pattern: "Uncategorized",
      leetcodeUrl: hints.slug
        ? `https://leetcode.com/problems/${hints.slug}/`
        : null,
      dateSolved: todayLocalISO(),
      tags: [],
      source: "manual-needed",
      status: "needs-fill",
    };
    body = buildBlankBody(meta);
  }

  const filePath = path.join(PROBLEMS_DIR, `${meta.slug}.md`);
  if (fs.existsSync(filePath) && !force) {
    fail(
      `Note already exists: content/problems/${meta.slug}.md\n  Pass --force to overwrite, e.g. npm run new:problem ${raw} -- --force`
    );
  }

  fs.mkdirSync(PROBLEMS_DIR, { recursive: true });
  const contents = `${buildFrontmatter(meta)}\n\n${body}`;
  fs.writeFileSync(filePath, contents, "utf8");

  const verb = entry ? "Generated starter note" : "Generated blank template";
  console.log(`\u2713 ${verb}: content/problems/${meta.slug}.md`);
  console.log(`  title:   ${meta.title}`);
  console.log(`  pattern: ${meta.pattern}`);
  console.log(`  status:  ${meta.status} (source: ${meta.source})`);
  if (!entry) {
    console.log(
      "  note:    not in registry — fill in the sections, or add it to content/problem-registry.json."
    );
  }
}

main();
