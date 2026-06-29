"use client";

import { useEffect, useState } from "react";
import ProblemCard from "@/components/ProblemCard";
import DifficultyBadge from "@/components/DifficultyBadge";
import MasteryBar from "@/components/MasteryBar";
import { fetchProblems, fetchTopics } from "@/lib/problems";
import type { ProblemListItem, Topic } from "@/lib/problems";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

const COMPANIES = [
  { label: "Google", value: "google" },
  { label: "Amazon", value: "amazon" },
  { label: "Meta", value: "meta" },
  { label: "Microsoft", value: "microsoft" },
  { label: "Apple", value: "apple" },
  { label: "Bloomberg", value: "bloomberg" },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
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
      company: selectedCompany || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then((res) => {
        setProblems(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [selectedTopic, selectedDifficulty, selectedCompany, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasActiveFilters = selectedTopic || selectedDifficulty || selectedCompany;

  function clearAllFilters() {
    setSelectedTopic("");
    setSelectedDifficulty("");
    setSelectedCompany("");
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Problems</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {total} problems found
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-3 text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear all filters
              </button>
            )}
          </p>
        </div>

        {/* Mastery bar */}
        <div className="mb-6">
          <MasteryBar />
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">

          {/* Difficulty */}
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => { setSelectedDifficulty(""); setPage(1); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                !selectedDifficulty
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              All
            </button>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => { setSelectedDifficulty(d === selectedDifficulty ? "" : d); setPage(1); }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                  selectedDifficulty === d
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Company dropdown */}
          <select
            value={selectedCompany}
            onChange={(e) => { setSelectedCompany(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">All Companies</option>
            {COMPANIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Topic dropdown */}
          <select
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-blue-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.name} value={t.name}>
                {t.display_name}
              </option>
            ))}
          </select>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedDifficulty && (
                <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
                  <DifficultyBadge difficulty={selectedDifficulty as "easy" | "medium" | "hard"} />
                  <button onClick={() => { setSelectedDifficulty(""); setPage(1); }} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                </span>
              )}
              {selectedCompany && (
                <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs capitalize dark:border-gray-700 dark:bg-gray-800">
                  {selectedCompany}
                  <button onClick={() => { setSelectedCompany(""); setPage(1); }} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                </span>
              )}
              {selectedTopic && (
                <span className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs dark:border-gray-700 dark:bg-gray-800">
                  {topics.find((t) => t.name === selectedTopic)?.display_name ?? selectedTopic}
                  <button onClick={() => { setSelectedTopic(""); setPage(1); }} className="ml-1 text-gray-400 hover:text-gray-600">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Problem grid */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            No problems found for this filter.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p) => (
                <ProblemCard key={p.id} problem={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
