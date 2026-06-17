"use client";

import { useActionState, useState } from "react";
import { createProblemAction, type CreateProblemState } from "./actions";

function todayLocalISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const initialState: CreateProblemState = {};

export function AddProblemForm() {
  const [state, formAction, isPending] = useActionState(
    createProblemAction,
    initialState
  );
  // Controlled so the typed value survives a failed submit (e.g. "already
  // exists"), letting the user tick "Overwrite" and retry without retyping.
  const [input, setInput] = useState("");

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="input"
          className="block text-sm font-medium text-zinc-200"
        >
          LeetCode URL, number, slug, or title
        </label>
        <input
          id="input"
          name="input"
          type="text"
          required
          autoFocus
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 217 · contains-duplicate · https://leetcode.com/problems/two-sum/"
          className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Known problems get starter content; anything else gets a blank template
          to fill in.
        </p>
      </div>

      <details className="group rounded-lg border border-zinc-800/80 bg-zinc-900/30">
        <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-100">
          Advanced options
          <span className="ml-2 text-xs text-zinc-600 group-open:hidden">
            (date, pattern, difficulty, overwrite)
          </span>
        </summary>

        <div className="space-y-5 border-t border-zinc-800/80 px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="dateSolved"
                className="block text-sm font-medium text-zinc-200"
              >
                Date solved
              </label>
              <input
                id="dateSolved"
                name="dateSolved"
                type="date"
                defaultValue={todayLocalISO()}
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 [color-scheme:dark]"
              />
            </div>

            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-zinc-200"
              >
                Difficulty override
              </label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue=""
                className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 [color-scheme:dark]"
              >
                <option value="">Auto / keep default</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="pattern"
              className="block text-sm font-medium text-zinc-200"
            >
              Pattern override
            </label>
            <input
              id="pattern"
              name="pattern"
              type="text"
              autoComplete="off"
              placeholder="e.g. Arrays & Hashing, Sliding Window"
              className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-zinc-300">
            <input
              type="checkbox"
              name="overwrite"
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-sky-500"
            />
            Overwrite existing note
          </label>
        </div>
      </details>

      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300"
        >
          <span aria-hidden className="mt-0.5">
            &#9888;
          </span>
          <span>{state.error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {isPending ? "Creating…" : "Create note"}
        </button>
        <span className="text-xs text-zinc-600">
          Writes a Markdown file to <code>content/problems/</code>
        </span>
      </div>
    </form>
  );
}
