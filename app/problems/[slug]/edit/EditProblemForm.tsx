"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { updateProblemAction, type EditProblemState } from "./actions";

export interface EditInitial {
  slug: string;
  leetcodeNumber: string;
  langs: Record<string, string>;
  title: string;
  difficulty: string;
  pattern: string;
  leetcodeUrl: string;
  dateSolved: string;
  tags: string;
  source: string;
  status: string;
  sections: Record<string, string>;
}

const initialState: EditProblemState = {};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20";

const DIFFICULTIES = ["Easy", "Medium", "Hard", "Unknown"];
const STATUSES = [
  "complete",
  "needs-personal-notes",
  "needs-fill",
  "needs-review",
];

export function EditProblemForm({
  initial,
  sectionHeadings,
  codeSections,
}: {
  initial: EditInitial;
  sectionHeadings: string[];
  codeSections: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateProblemAction,
    initialState
  );

  const codeSet = new Set(codeSections);

  const [meta, setMeta] = useState({
    title: initial.title,
    difficulty: initial.difficulty,
    pattern: initial.pattern,
    leetcodeUrl: initial.leetcodeUrl,
    dateSolved: initial.dateSolved,
    tags: initial.tags,
    status: initial.status,
    source: initial.source,
  });
  const [sections, setSections] = useState<Record<string, string>>(
    initial.sections
  );
  const [langs, setLangs] = useState<Record<string, string>>(initial.langs);

  const setMetaField = (key: keyof typeof meta, value: string) =>
    setMeta((m) => ({ ...m, [key]: value }));
  const setSection = (heading: string, value: string) =>
    setSections((s) => ({ ...s, [heading]: value }));
  const setLang = (heading: string, value: string) =>
    setLangs((l) => ({ ...l, [heading]: value }));

  const detailHref = `/problems/${initial.slug}`;

  return (
    <form action={formAction} className="pb-12">
      <input type="hidden" name="slug" value={initial.slug} />
      <input
        type="hidden"
        name="leetcodeNumber"
        value={initial.leetcodeNumber}
      />

      <div className="flex items-center justify-between gap-3">
        <Link
          href={detailHref}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <span aria-hidden>&larr;</span> Back to note
        </Link>
      </div>

      <header className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Edit note
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Each section is its own field. Empty sections are kept in the standard
          order when you save.
        </p>
      </header>

      {/* Frontmatter card */}
      <section className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-300">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-zinc-200">Title</span>
            <input
              name="title"
              value={meta.title}
              onChange={(e) => setMetaField("title", e.target.value)}
              required
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Difficulty</span>
            <select
              name="difficulty"
              value={meta.difficulty}
              onChange={(e) => setMetaField("difficulty", e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Status</span>
            <select
              name="status"
              value={meta.status}
              onChange={(e) => setMetaField("status", e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">Pattern</span>
            <input
              name="pattern"
              value={meta.pattern}
              onChange={(e) => setMetaField("pattern", e.target.value)}
              placeholder="e.g. Arrays & Hashing"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-zinc-200">
              Date solved
            </span>
            <input
              type="date"
              name="dateSolved"
              value={meta.dateSolved}
              onChange={(e) => setMetaField("dateSolved", e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-zinc-200">
              LeetCode URL
            </span>
            <input
              name="leetcodeUrl"
              value={meta.leetcodeUrl}
              onChange={(e) => setMetaField("leetcodeUrl", e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className={inputClass}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-zinc-200">Tags</span>
            <input
              name="tags"
              value={meta.tags}
              onChange={(e) => setMetaField("tags", e.target.value)}
              placeholder="comma, separated, tags"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-zinc-600">
              Comma-separated.
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-zinc-200">Source</span>
            <input
              name="source"
              value={meta.source}
              onChange={(e) => setMetaField("source", e.target.value)}
              placeholder="e.g. generated-starter"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* Section cards */}
      <section className="mt-6 space-y-4">
        {sectionHeadings.map((heading) => {
          const isCode = codeSet.has(heading);
          const isKeyCode = heading === "Key Code";
          return (
            <div
              key={heading}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-200">
                  {heading}
                  {isCode && (
                    <span className="ml-2 rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      Code
                    </span>
                  )}
                </span>
                {isCode && (
                  <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                    Language
                    <input
                      name={`lang:${heading}`}
                      value={langs[heading] ?? ""}
                      onChange={(e) => setLang(heading, e.target.value)}
                      placeholder="python"
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      className="w-28 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </label>
                )}
              </div>
              <textarea
                name={`section:${heading}`}
                value={sections[heading] ?? ""}
                onChange={(e) => setSection(heading, e.target.value)}
                rows={isCode ? (isKeyCode ? 14 : 8) : 4}
                spellCheck={!isCode}
                autoCapitalize={isCode ? "off" : undefined}
                autoCorrect={isCode ? "off" : undefined}
                placeholder={
                  isCode ? "// your code" : "Write this section…"
                }
                className={`mt-2 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 ${
                  isCode ? "font-mono leading-relaxed" : ""
                }`}
              />
              {isCode && (
                <span className="mt-1 block text-xs text-zinc-600">
                  Saved as a fenced code block and rendered with syntax
                  highlighting.
                </span>
              )}
            </div>
          );
        })}
      </section>

      {state.error && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300"
        >
          <span aria-hidden className="mt-0.5">
            &#9888;
          </span>
          <span>{state.error}</span>
        </div>
      )}

      <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-zinc-900 bg-[#0a0a0b]/90 py-4 backdrop-blur">
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
          {isPending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={detailHref}
          className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
