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

## Adding a Note

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
