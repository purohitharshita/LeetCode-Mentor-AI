import Link from "next/link";
import DifficultyBadge from "./DifficultyBadge";
import type { ProblemListItem } from "@/lib/problems";

interface ProblemCardProps {
  problem: ProblemListItem;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  const primaryTopic = problem.topics.find((t) => t.is_primary) ?? problem.topics[0];

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {problem.title}
        </h3>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {problem.topics.slice(0, 3).map((t) => (
          <span
            key={t.name}
            className={`rounded-full px-2 py-0.5 text-xs ${
              t.is_primary
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {t.display_name}
          </span>
        ))}
      </div>

      {problem.companies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {problem.companies.slice(0, 4).map((c) => (
            <span
              key={c}
              className="rounded px-1.5 py-0.5 text-xs text-gray-400 dark:text-gray-500 capitalize"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
