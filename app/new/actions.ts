"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createProblemNote,
  NoteExistsError,
  InvalidInputError,
} from "@/lib/problem-generator.mjs";

export interface CreateProblemState {
  error?: string;
}

export async function createProblemAction(
  _prevState: CreateProblemState,
  formData: FormData
): Promise<CreateProblemState> {
  const input = String(formData.get("input") ?? "").trim();
  const dateSolved = String(formData.get("dateSolved") ?? "").trim();
  const pattern = String(formData.get("pattern") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "").trim();
  const overwrite = formData.get("overwrite") === "on";

  if (!input) {
    return { error: "Enter a LeetCode URL, problem number, slug, or title." };
  }

  let slug: string;
  try {
    const result = await createProblemNote(input, {
      force: overwrite,
      dateSolved: dateSolved || undefined,
      pattern: pattern || undefined,
      difficulty: difficulty || undefined,
    });
    slug = result.slug;
  } catch (error) {
    if (error instanceof NoteExistsError) {
      return { error: error.message };
    }
    if (error instanceof InvalidInputError) {
      return { error: error.message };
    }
    return { error: "Something went wrong while creating the note." };
  }

  // Refresh the grouped home page and the new note's page, then navigate to it.
  revalidatePath("/");
  revalidatePath(`/problems/${slug}`);
  redirect(`/problems/${slug}`);
}
