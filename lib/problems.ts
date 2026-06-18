import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Unknown";

export type ProblemStatus =
  | "complete"
  | "needs-personal-notes"
  | "needs-fill"
  | "needs-review";

export interface ProblemFrontmatter {
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: string;
  leetcodeNumber?: number | null;
  leetcodeUrl?: string;
  dateSolved?: string;
  tags?: string[];
  source?: string;
  status?: ProblemStatus;
}

export interface Problem extends ProblemFrontmatter {
  content: string;
}

export interface PatternGroup {
  pattern: string;
  problems: Problem[];
}

const CONTENT_DIR = path.join(process.cwd(), "content", "problems");

function readProblemFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
}

function parseProblem(fileName: string): Problem {
  const fullPath = path.join(CONTENT_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  const fallbackSlug = fileName.replace(/\.mdx?$/, "");

  return {
    title: data.title ?? fallbackSlug,
    slug: data.slug ?? fallbackSlug,
    difficulty: (data.difficulty ?? "Easy") as Difficulty,
    pattern: data.pattern ?? "Uncategorized",
    leetcodeNumber:
      typeof data.leetcodeNumber === "number" ? data.leetcodeNumber : null,
    leetcodeUrl: data.leetcodeUrl ?? undefined,
    dateSolved: data.dateSolved,
    tags: Array.isArray(data.tags) ? data.tags : [],
    source: data.source ?? undefined,
    status: (data.status ?? undefined) as ProblemStatus | undefined,
    content,
  };
}

/**
 * Extract the body of a `## Heading` markdown section (until the next `##`).
 * Returns null when the section is absent.
 */
function extractSection(content: string, heading: string): string | null {
  const lines = content.split(/\r?\n/);
  const body: string[] = [];
  let capturing = false;

  for (const line of lines) {
    const match = /^##\s+(.*?)\s*$/.exec(line);
    if (match) {
      if (capturing) break;
      if (match[1].toLowerCase() === heading.toLowerCase()) {
        capturing = true;
        continue;
      }
    } else if (capturing) {
      body.push(line);
    }
  }

  return capturing ? body.join("\n") : null;
}

/** True when a "My First Approach" section exists but has no real content. */
export function hasEmptyMyFirstApproach(content: string): boolean {
  const section = extractSection(content, "My First Approach");
  if (section === null) return false;
  const cleaned = section.replace(/<!--[\s\S]*?-->/g, "").trim();
  return cleaned.length === 0;
}

/** Whether a problem still needs author attention (badge + reminder). */
export function isPersonalNotePending(problem: Problem): boolean {
  return (
    problem.status === "needs-personal-notes" ||
    problem.status === "needs-fill" ||
    hasEmptyMyFirstApproach(problem.content)
  );
}

export function getAllProblems(): Problem[] {
  return readProblemFiles()
    .map(parseProblem)
    .sort((a, b) => {
      // Most recently solved first; fall back to title.
      const dateA = a.dateSolved ?? "";
      const dateB = b.dateSolved ?? "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return a.title.localeCompare(b.title);
    });
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return getAllProblems().find((problem) => problem.slug === slug);
}

export function getProblemsByPattern(): PatternGroup[] {
  const problems = getAllProblems();
  const groups = new Map<string, Problem[]>();

  for (const problem of problems) {
    const existing = groups.get(problem.pattern) ?? [];
    existing.push(problem);
    groups.set(problem.pattern, existing);
  }

  return Array.from(groups.entries())
    .map(([pattern, items]) => ({ pattern, problems: items }))
    .sort((a, b) => a.pattern.localeCompare(b.pattern));
}

export function getAllSlugs(): string[] {
  return getAllProblems().map((problem) => problem.slug);
}
