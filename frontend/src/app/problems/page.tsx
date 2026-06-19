"use client";

import { useEffect, useState } from "react";
import ProblemCard from "@/components/ProblemCard";
import DifficultyBadge from "@/components/DifficultyBadge";
import { fetchProblems, fetchTopics } from "@/lib/problems";
import type { ProblemListItem, Topic } from "@/lib/problems";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProblems({
      topic: selectedTopic || undefined,
      difficulty: selectedDifficulty || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then((res) => {
        setProblems(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [selectedTopic, selectedDifficulty, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleTopicChange(topic: string) {
    setSelectedTopic(topic);
    setPage(1);
  }

  function handleDifficultyChange(diff: string) {
    setSelectedDifficulty(diff === selectedDifficulty ? "" : diff);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Problems
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {total} problems across 18 topics
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="w-56 shrink-0">
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              {/* Difficulty */}
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Difficulty
              </p>
              <div className="flex flex-col gap-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDifficultyChange(d)}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
                      selectedDifficulty === d
                        ? "bg-gray-100 font-medium dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <DifficultyBadge difficulty={d} />
                  </button>
                ))}
              </div>

              {/* Topic */}
              <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Topic
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleTopicChange("")}
                  className={`rounded-md px-3 py-1.5 text-left text-sm transition ${
                    !selectedTopic
                      ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  All Topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => handleTopicChange(t.name)}
                    className={`rounded-md px-3 py-1.5 text-left text-sm transition ${
                      selectedTopic === t.name
                        ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {t.display_name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Problem list */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"
                  />
                ))}
              </div>
            ) : problems.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                No problems found for this filter.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {problems.map((p) => (
                    <ProblemCard key={p.id} problem={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
