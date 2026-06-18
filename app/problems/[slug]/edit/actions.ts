"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  updateProblemNote,
  NoteNotFoundError,
  InvalidInputError,
} from "@/lib/problem-generator.mjs";
import {
  STANDARD_SECTIONS,
  CODE_SECTIONS,
  wrapCodeBlock,
} from "@/lib/problem-markdown.mjs";

export interface EditProblemState {
  error?: string;
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function updateProblemAction(
  _prevState: EditProblemState,
  formData: FormData
): Promise<EditProblemState> {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { error: "Missing problem slug." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title cannot be empty." };

  const leetcodeNumberRaw = String(formData.get("leetcodeNumber") ?? "").trim();
  const leetcodeNumber =
    leetcodeNumberRaw && /^\d+$/.test(leetcodeNumberRaw)
      ? Number.parseInt(leetcodeNumberRaw, 10)
      : null;

  const frontmatter = {
    title,
    slug,
    leetcodeNumber,
    difficulty: String(formData.get("difficulty") ?? "Unknown").trim(),
    pattern: String(formData.get("pattern") ?? "").trim() || "Uncategorized",
    leetcodeUrl: String(formData.get("leetcodeUrl") ?? "").trim() || null,
    dateSolved: String(formData.get("dateSolved") ?? "").trim(),
    tags: parseTags(String(formData.get("tags") ?? "")),
    source: String(formData.get("source") ?? "").trim(),
    status: String(formData.get("status") ?? "").trim(),
  };

  // Code sections (My First Approach, Improved / Standard Approach, Key Code)
  // are edited as raw code and stored as fenced blocks so they render with
  // syntax highlighting. Other sections stay as markdown prose.
  const codeSet = new Set(CODE_SECTIONS);
  const sections: Record<string, string> = {};
  for (const heading of STANDARD_SECTIONS) {
    const raw = String(formData.get(`section:${heading}`) ?? "");
    if (codeSet.has(heading)) {
      const lang = String(formData.get(`lang:${heading}`) ?? "").trim();
      const code = raw.trim();
      sections[heading] = code ? wrapCodeBlock(code, lang) : "";
    } else {
      sections[heading] = raw.trim();
    }
  }

  try {
    updateProblemNote(slug, { frontmatter, sections });
  } catch (error) {
    if (error instanceof NoteNotFoundError) return { error: error.message };
    if (error instanceof InvalidInputError) return { error: error.message };
    return { error: "Something went wrong while saving the note." };
  }

  revalidatePath("/");
  revalidatePath(`/problems/${slug}`);
  redirect(`/problems/${slug}`);
}
