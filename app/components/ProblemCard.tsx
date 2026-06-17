import Link from "next/link";
import type { Problem } from "@/lib/problems";
import { DifficultyBadge } from "./DifficultyBadge";

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-zinc-100 transition-colors group-hover:text-white">
          {problem.title}
        </h3>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      {problem.tags && problem.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {problem.dateSolved && (
        <p className="mt-3 text-xs text-zinc-600">Solved {problem.dateSolved}</p>
      )}
    </Link>
  );
}
