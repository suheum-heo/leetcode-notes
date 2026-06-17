import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface ProblemFrontmatter {
  title: string;
  slug: string;
  difficulty: Difficulty;
  pattern: string;
  leetcodeUrl?: string;
  dateSolved?: string;
  tags?: string[];
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
    leetcodeUrl: data.leetcodeUrl,
    dateSolved: data.dateSolved,
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
  };
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
