"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  deleteProblemNote,
  NoteNotFoundError,
  InvalidInputError,
} from "@/lib/problem-generator.mjs";

export interface DeleteProblemState {
  error?: string;
}

export async function deleteProblemAction(
  _prevState: DeleteProblemState,
  formData: FormData
): Promise<DeleteProblemState> {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { error: "Missing problem slug." };

  try {
    deleteProblemNote(slug);
  } catch (error) {
    if (error instanceof NoteNotFoundError) return { error: error.message };
    if (error instanceof InvalidInputError) return { error: error.message };
    return { error: "Something went wrong while deleting the note." };
  }

  revalidatePath("/");
  revalidatePath(`/problems/${slug}`);
  redirect("/");
}
