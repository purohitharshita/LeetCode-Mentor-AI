import Link from "next/link";
import DifficultyBadge from "./DifficultyBadge";
import type { ProblemListItem } from "@/lib/problems";

interface ProblemCardProps {
  problem: ProblemListItem;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group block rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-5 transition hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-white transition group-hover:text-violet-300">
          {problem.title}
        </h3>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {problem.topics.slice(0, 3).map((t) => (
          <span
            key={t.name}
            className={`rounded-full px-2 py-0.5 text-xs ${
              t.is_primary
                ? "bg-violet-600/20 text-violet-400"
                : "bg-[#1e1e30] text-[#6b6b8a]"
            }`}
          >
            {t.display_name}
          </span>
        ))}
      </div>

      {problem.companies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {problem.companies.slice(0, 4).map((c) => (
            <span key={c} className="text-xs capitalize text-[#4a4a6a]">
              {c}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
