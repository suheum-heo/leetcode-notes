import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllSlugs,
  getProblemBySlug,
  getProblemsByPattern,
  isPersonalNotePending,
} from "@/lib/problems";
import { DifficultyBadge } from "@/app/components/DifficultyBadge";
import { StatusBadge } from "@/app/components/StatusBadge";
import { Markdown } from "@/app/components/Markdown";
import { ProblemActions } from "./ProblemActions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);
  if (!problem) return { title: "Not found" };
  return {
    title: `${problem.title} · Pattern Notes`,
    description: `${problem.pattern} — ${problem.difficulty}`,
  };
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const problem = getProblemBySlug(slug);

  if (!problem) notFound();

  const patternPeers = getProblemsByPattern()
    .find((group) => group.pattern === problem.pattern)
    ?.problems.filter((p) => p.slug !== problem.slug);

  const notesPending = isPersonalNotePending(problem);

  return (
    <article className="pb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <span aria-hidden>&larr;</span> All patterns
      </Link>

      <header className="mt-6 border-b border-zinc-900 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-zinc-800/60 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
              {problem.pattern}
            </span>
            <DifficultyBadge difficulty={problem.difficulty} />
            <StatusBadge status={problem.status} />
          </div>
          <ProblemActions slug={problem.slug} />
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-50">
          {problem.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
          {problem.leetcodeUrl && (
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 transition-colors hover:text-sky-300"
            >
              View on LeetCode <span aria-hidden>&#8599;</span>
            </a>
          )}
          {problem.dateSolved && <span>Solved {problem.dateSolved}</span>}
        </div>

        {problem.tags && problem.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {notesPending && (
        <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
          <span aria-hidden className="mt-0.5 text-amber-400">
            &#9998;
          </span>
          <span>
            Personal notes not added yet — this note still has starter content
            waiting for your own words.
          </span>
        </div>
      )}

      <div className="mt-8">
        <Markdown content={problem.content} />
      </div>

      {patternPeers && patternPeers.length > 0 && (
        <section className="mt-12 border-t border-zinc-900 pt-6">
          <h2 className="text-sm font-semibold text-zinc-400">
            More in {problem.pattern}
          </h2>
          <ul className="mt-3 space-y-1.5">
            {patternPeers.map((peer) => (
              <li key={peer.slug}>
                <Link
                  href={`/problems/${peer.slug}`}
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  <span className="text-zinc-700">&rarr;</span>
                  {peer.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
