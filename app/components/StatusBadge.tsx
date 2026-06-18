import type { ProblemStatus } from "@/lib/problems";

const LABELS: Partial<Record<ProblemStatus, string>> = {
  "needs-personal-notes": "Needs personal notes",
  "needs-fill": "Needs fill",
  "needs-review": "Needs review",
};

const STYLES: Partial<Record<ProblemStatus, string>> = {
  "needs-personal-notes": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  "needs-fill": "bg-fuchsia-500/10 text-fuchsia-400 ring-fuchsia-500/20",
  "needs-review": "bg-sky-500/10 text-sky-400 ring-sky-500/20",
};

export function StatusBadge({ status }: { status?: ProblemStatus }) {
  if (!status || !LABELS[status]) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
