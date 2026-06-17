import type { Metadata } from "next";
import Link from "next/link";
import { AddProblemForm } from "./AddProblemForm";

export const metadata: Metadata = {
  title: "Add Problem · Pattern Notes",
  description: "Generate a new LeetCode problem note from a URL, number, or slug.",
};

export default function NewProblemPage() {
  return (
    <div className="pb-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <span aria-hidden>&larr;</span> All patterns
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
          Add Problem
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Paste a LeetCode URL or type a problem number, slug, or title. A
          starter note is generated for known problems and a blank template for
          everything else — no terminal required.
        </p>
      </header>

      <div className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 sm:p-6">
        <AddProblemForm />
      </div>
    </div>
  );
}
