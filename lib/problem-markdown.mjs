// Parsing/serialization for problem notes. Splits the body into the standard
// named sections so each can be edited individually, and rebuilds the file
// preserving the frontmatter + section structure. No filesystem access here.

import matter from "gray-matter";

// Sections edited as code (monospace editor, stored as fenced code blocks).
export const CODE_SECTIONS = [
  "My First Approach",
  "Improved / Standard Approach",
  "Key Code",
];

// Canonical section order written back to disk.
export const STANDARD_SECTIONS = [
  "Core Idea",
  "Pattern",
  "My First Approach",
  "Issue With My First Approach",
  "Improved / Standard Approach",
  "Key Code",
  "Why It Works",
  "Complexity",
  "What I Learned",
  "When To Use This Pattern Again",
  "Similar Problems",
];

function quote(value) {
  return JSON.stringify(value ?? "");
}

// Serialize note frontmatter in a stable key order (matches the generator).
export function serializeFrontmatter(meta) {
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

// First level-1 heading ("# Title") in the body, if any.
function extractTitle(body) {
  const match = /^#\s+(.*?)\s*$/m.exec(body);
  return match ? match[1] : null;
}

// Split a markdown body into a { [heading]: content } map keyed by "## Heading".
export function extractSections(body) {
  const lines = String(body ?? "").split(/\r?\n/);
  const sections = {};
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current !== null) sections[current] = buffer.join("\n").trim();
  };

  for (const line of lines) {
    const match = /^##\s+(.*?)\s*$/.exec(line);
    if (match) {
      flush();
      current = match[1];
      buffer = [];
    } else if (current !== null) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

// Parse a full note into { frontmatter, title, sections }.
export function parseProblemMarkdown(raw) {
  const { data, content } = matter(String(raw ?? ""));
  return {
    frontmatter: data ?? {},
    title: data?.title ?? extractTitle(content) ?? "",
    sections: extractSections(content),
  };
}

// Rebuild the markdown body from a title + sections, in the standard order.
export function updateSections(title, sections) {
  const parts = [`# ${title}`];
  for (const heading of STANDARD_SECTIONS) {
    const content = (sections?.[heading] ?? "").trim();
    parts.push(content ? `## ${heading}\n${content}` : `## ${heading}`);
  }
  return `${parts.join("\n\n")}\n`;
}

// Serialize a parsed note ({ frontmatter, sections }) back into a file string.
export function serializeProblemMarkdown({ frontmatter, sections }) {
  return `${serializeFrontmatter(frontmatter)}\n\n${updateSections(
    frontmatter.title,
    sections
  )}`;
}

// Pull the code + language out of a single fenced code block, if the section is
// exactly one. Lets the Key Code field edit code without the ``` fences.
export function unwrapCodeBlock(content) {
  const match = /^```([^\n]*)\n([\s\S]*?)\n?```$/.exec(String(content ?? "").trim());
  if (match) return { lang: match[1].trim(), code: match[2] };
  return { lang: "", code: String(content ?? "") };
}

export function wrapCodeBlock(code, lang) {
  return "```" + (lang ?? "") + "\n" + (code ?? "") + "\n```";
}

// Prepare a code section for the editor: pull code/lang out of a fenced block,
// and blank out generator placeholder comments / boilerplate so the user starts
// with an empty code editor instead of prose to delete.
export function loadCodeSection(content) {
  const raw = String(content ?? "").trim();
  const wasFenced = /^```/.test(raw);
  const { code, lang } = unwrapCodeBlock(raw);
  if (wasFenced) return { code, lang };

  // Not already code: drop HTML comments; if nothing meaningful remains, blank.
  const withoutComments = raw.replace(/<!--[\s\S]*?-->/g, "").trim();
  return { code: withoutComments, lang: "" };
}
