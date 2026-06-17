import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeetCode Pattern Notes",
  description:
    "A minimal, pattern-first collection of LeetCode notes — grouped by DSA pattern, not problem number.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 sm:px-6">
          <header className="flex items-center justify-between py-6">
            <Link
              href="/"
              className="group flex items-center gap-2 text-sm font-medium tracking-tight"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 font-mono text-xs font-bold text-white">
                {"{}"}
              </span>
              <span className="text-zinc-100 group-hover:text-white">
                pattern.notes
              </span>
            </Link>
            <nav className="flex items-center gap-3 text-sm text-zinc-400 sm:gap-5">
              <Link
                href="/"
                className="hidden transition-colors hover:text-zinc-100 sm:inline"
              >
                Patterns
              </Link>
              <a
                href="https://leetcode.com"
                target="_blank"
                rel="noreferrer"
                className="hidden transition-colors hover:text-zinc-100 sm:inline"
              >
                LeetCode
              </a>
              <Link
                href="/new"
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 font-medium text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
              >
                <span aria-hidden className="text-sky-400">
                  +
                </span>
                Add Problem
              </Link>
            </nav>
          </header>

          <main className="flex-1 py-4">{children}</main>

          <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
            Built with Next.js · Notes written in Markdown · No database, just files.
          </footer>
        </div>
      </body>
    </html>
  );
}
