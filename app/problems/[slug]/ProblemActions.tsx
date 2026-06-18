"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { deleteProblemAction, type DeleteProblemState } from "./actions";

const initialState: DeleteProblemState = {};

export function ProblemActions({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteProblemAction,
    initialState
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, isPending]);

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/problems/${slug}/edit`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
      >
        <span aria-hidden>&#9998;</span> Edit
      </Link>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-1.5 text-sm font-medium text-rose-300 transition-colors hover:border-rose-500/50 hover:bg-rose-500/10"
      >
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-title"
              className="text-lg font-semibold text-zinc-100"
            >
              Delete this note?
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              This will remove the markdown file from{" "}
              <code className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">
                content/problems
              </code>
              . This action cannot be undone.
            </p>

            {state.error && (
              <p className="mt-3 text-sm text-rose-400">{state.error}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <form action={formAction}>
                <input type="hidden" name="slug" value={slug} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && (
                    <span
                      aria-hidden
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                  )}
                  {isPending ? "Deleting…" : "Delete note"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
