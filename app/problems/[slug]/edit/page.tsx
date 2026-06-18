import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  readProblemNote,
  NoteNotFoundError,
} from "@/lib/problem-generator.mjs";
import {
  STANDARD_SECTIONS,
  CODE_SECTIONS,
  loadCodeSection,
} from "@/lib/problem-markdown.mjs";
import { EditProblemForm, type EditInitial } from "./EditProblemForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Edit · Pattern Notes",
};

interface ParsedNote {
  frontmatter: Record<string, unknown>;
  title: string;
  sections: Record<string, string>;
}

export default async function EditProblemPage({ params }: PageProps) {
  const { slug } = await params;

  let parsed: ParsedNote;
  try {
    parsed = readProblemNote(slug) as ParsedNote;
  } catch (error) {
    if (error instanceof NoteNotFoundError) notFound();
    throw error;
  }

  const fm = parsed.frontmatter;
  const codeSet = new Set(CODE_SECTIONS);

  const sections: Record<string, string> = {};
  const langs: Record<string, string> = {};
  for (const heading of STANDARD_SECTIONS) {
    const raw = parsed.sections[heading] ?? "";
    if (codeSet.has(heading)) {
      const { code, lang } = loadCodeSection(raw);
      sections[heading] = code;
      langs[heading] = lang;
    } else {
      sections[heading] = raw;
    }
  }

  const initial: EditInitial = {
    slug: String(fm.slug ?? slug),
    leetcodeNumber:
      fm.leetcodeNumber == null ? "" : String(fm.leetcodeNumber),
    langs,
    title: parsed.title || String(fm.title ?? ""),
    difficulty: String(fm.difficulty ?? "Unknown"),
    pattern: String(fm.pattern ?? ""),
    leetcodeUrl: fm.leetcodeUrl ? String(fm.leetcodeUrl) : "",
    dateSolved: String(fm.dateSolved ?? ""),
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]).join(", ") : "",
    source: String(fm.source ?? ""),
    status: String(fm.status ?? "needs-personal-notes"),
    sections,
  };

  return (
    <EditProblemForm
      initial={initial}
      sectionHeadings={[...STANDARD_SECTIONS]}
      codeSections={[...CODE_SECTIONS]}
    />
  );
}
