import { getProblemsByPattern, getAllProblems } from "@/lib/problems";
import { ProblemCard } from "./components/ProblemCard";

export default function HomePage() {
  const groups = getProblemsByPattern();
  const total = getAllProblems().length;

  return (
    <div>
      <section className="py-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          LeetCode Pattern Notes
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          A pattern-first way to study algorithms. These notes are organized by
          the underlying DSA pattern — so you learn the technique once and
          recognize it everywhere.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-800 px-3 py-1">
            {total} problems
          </span>
          <span className="rounded-full border border-zinc-800 px-3 py-1">
            {groups.length} patterns
          </span>
        </div>
      </section>

      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10 pb-8">
          {groups.map((group) => (
            <section key={group.pattern} id={slugifyPattern(group.pattern)}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
                  {group.pattern}
                </h2>
                <span className="text-xs text-zinc-600">
                  {group.problems.length}{" "}
                  {group.problems.length === 1 ? "problem" : "problems"}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.problems.map((problem) => (
                  <ProblemCard key={problem.slug} problem={problem} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function slugifyPattern(pattern: string): string {
  return pattern.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
      <p className="text-zinc-400">No notes yet.</p>
      <p className="mt-2 text-sm text-zinc-600">
        Add a markdown file to{" "}
        <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-zinc-300">
          content/problems/
        </code>{" "}
        to get started.
      </p>
    </div>
  );
}
