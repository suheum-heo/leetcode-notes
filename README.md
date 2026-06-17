# LeetCode Pattern Notes

A clean, minimal developer-portfolio-style site for documenting LeetCode
problems **by pattern**, not by problem number. Write notes as Markdown files and
the site automatically groups them by DSA pattern.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS v4
- Markdown content via [`gray-matter`](https://github.com/jonschlinkert/gray-matter)
  + [`react-markdown`](https://github.com/remarkjs/react-markdown)
- Syntax highlighting via `rehype-highlight`
- No database — everything is files on disk.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a New Problem (Generator)

The fastest way to add a note is the generator script. Give it a problem number,
slug, title, or LeetCode URL and it creates a starter note in `content/problems/`:

```bash
npm run new:problem 217
npm run new:problem contains-duplicate
npm run new:problem "https://leetcode.com/problems/contains-duplicate/"
```

What it does:

- Resolves the input against `content/problem-registry.json`.
- Uses **today's local date** for `dateSolved`.
- **Never overwrites** an existing note unless you pass a force flag:

  ```bash
  npm run new:problem 217 -- --force
  ```

  (The `--` is required so npm forwards the flag to the script.)

### Known vs. unknown problems

- **In the registry** (Contains Duplicate, Two Sum, Valid Anagram, Best Time to
  Buy and Sell Stock, Valid Parentheses, Binary Search): the note is generated
  with reference content for _Core Idea_, _Pattern_, _Improved / Standard
  Approach_, _Key Code_, _Why It Works_, _Complexity_, and _Similar Problems_.
  Personal sections are left blank as HTML comments.
  Frontmatter: `source: "generated-starter"`, `status: "needs-personal-notes"`.

- **Not in the registry**: a blank template is generated with the title/slug/URL
  filled in where possible, every section left as an HTML-comment placeholder.
  Frontmatter: `source: "manual-needed"`, `status: "needs-fill"`.

To teach the generator a new problem, add an entry to
`content/problem-registry.json` (keyed by slug) with a `starter` block.

### Generated note sections

`Core Idea` · `Pattern` · `My First Approach` · `Issue With My First Approach` ·
`Improved / Standard Approach` · `Key Code` · `Why It Works` · `Complexity` ·
`What I Learned` · `When To Use This Pattern Again` · `Similar Problems`

The site shows a **status badge** on cards and a "Personal notes not added yet"
reminder on the problem page until you fill in your _My First Approach_ section.

## Adding a Note Manually

Create a Markdown file in `content/problems/` (`.md` or `.mdx`) with frontmatter:

```markdown
---
title: "Contains Duplicate"
slug: "contains-duplicate"
difficulty: "Easy"            # Easy | Medium | Hard
pattern: "Arrays & Hashing"   # used to group on the home page
leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/"
dateSolved: "2026-06-17"
tags: ["set", "hashing", "duplicates"]
---

# Contains Duplicate

## Core Idea
...
```

That's it — the home page will pick it up and slot it under its pattern. Problems
are sorted by `dateSolved` (newest first), and patterns are listed alphabetically.

## Project Structure

```
app/
  components/        Reusable UI (cards, badges, markdown renderer)
  problems/[slug]/   Problem detail page
  page.tsx           Home page grouped by pattern
content/problems/    Your Markdown notes (the source of truth)
lib/problems.ts      Frontmatter parsing + grouping logic
```

## Build

```bash
npm run build && npm start
```
