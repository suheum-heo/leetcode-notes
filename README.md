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

## Adding a New Problem

There are two ways to add a note — both share the same generator logic in
`lib/problem-generator.mjs`, so they behave identically.

### Adding from the frontend (`/new`)

Click **"+ Add Problem"** in the header (or visit
[`/new`](http://localhost:3000/new)) and fill in the form:

- **Main input:** a LeetCode URL, problem number, slug, or title.
- **Advanced options:** `dateSolved` (defaults to today), a pattern override, a
  difficulty override, and an **"Overwrite existing note"** checkbox.

On submit it writes the Markdown file and redirects you to the new problem page.
If the note already exists (and overwrite is off) you'll see a friendly
"This note already exists." error.

> This is a local developer tool — it has no auth/database, only writes inside
> `content/problems/`, sanitizes the slug, and prevents path traversal. It never
> fetches LeetCode problem statements; it only uses registry/template content.

### Editing a note

Open any problem page and click **Edit** (next to the title) to go to
`/problems/[slug]/edit`. Each frontmatter field (title, difficulty, pattern,
LeetCode URL, date solved, tags, status, source) and each body section (Core
Idea, Pattern, My First Approach, … Similar Problems) is its own field — you
never edit raw markdown by hand. **Save changes** rewrites the markdown file
(preserving frontmatter + the standard section order) and returns you to the
note. Editing only touches the markdown file; it never changes
`content/problem-registry.json`.

### Deleting a note

On a problem page, click **Delete**. A confirmation dialog warns that this
removes the markdown file from `content/problems`. Confirming deletes the file
and returns you to the home page.

> **Filesystem workflow caveat:** Add/Edit/Delete read and write real files in
> `content/problems/`. This works great locally, but on a serverless host
> (e.g. Vercel) the filesystem is read-only/ephemeral, so these write operations
> won't persist there. To make editing work in production, wire it up to a Git
> commit (e.g. the GitHub API) or a database later.

### From the CLI (`npm run new:problem`)

Give the script a problem number, slug, title, or LeetCode URL and it creates a
starter note in `content/problems/`:

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

### Resolution order

Both flows resolve the input in three steps (see `lib/problem-generator.mjs`):

1. **Local registry** (`content/problem-registry.json`) — e.g. Contains
   Duplicate, Two Sum, Subsets, Binary Search. Generates full reference content
   (_Core Idea_, _Pattern_, _Improved / Standard Approach_, _Key Code_, _Why It
   Works_, _Complexity_, _Similar Problems_); personal sections stay as HTML
   comments. Frontmatter: `source: "generated-starter"`,
   `status: "needs-personal-notes"`.

2. **Live LeetCode metadata** — if not in the registry, the generator queries
   LeetCode's public GraphQL API (and the problem list to map a number → slug)
   for **metadata only**: title, slug, difficulty, and topic tags. It infers a
   default pattern from the tags and writes an honest starter template. It
   **never** fetches or copies the problem statement. So `78` becomes
   `subsets.md` ("Subsets", Backtracking), not `problem-78.md`. Frontmatter:
   `source: "leetcode-metadata"`, `status: "needs-personal-notes"`.

3. **Blank template** — if the problem isn't in the registry and metadata can't
   be fetched (offline / not found), a blank fill-me template is written.
   Frontmatter: `source: "manual-needed"`, `status: "needs-fill"`.

To give a problem curated content, add an entry to
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
