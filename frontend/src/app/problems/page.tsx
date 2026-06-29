"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  useEffect(() => { fetchTopics().then(setTopics); }, []);

  useEffect(() => {
    setLoading(true);
    fetchProblems({
      topic: selectedTopic || undefined,
      difficulty: selectedDifficulty || undefined,
      company: selectedCompany || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then((res) => { setProblems(res.items); setTotal(res.total); })
      .finally(() => setLoading(false));
  }, [selectedTopic, selectedDifficulty, selectedCompany, page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasActiveFilters = selectedTopic || selectedDifficulty || selectedCompany;

  function clearAllFilters() {
    setSelectedTopic(""); setSelectedDifficulty(""); setSelectedCompany(""); setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Problems
              <span className="ml-3 text-sm font-normal text-[#6b6b8a]">{total} found</span>
            </h1>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="mt-1 text-xs text-violet-400 hover:text-violet-300">
                Clear all filters
              </button>
            )}
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl border border-[#2d2d4e] bg-[#13131f] px-4 py-2 text-xs font-medium text-[#a0a0c0] transition hover:border-violet-500/50 hover:text-white"
          >
            👤 Profile
          </Link>
        </div>

        {/* Mastery bar */}
        <div className="mb-6">
          <MasteryBar />
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">

          {/* Difficulty pills */}
          <div className="flex items-center gap-1 rounded-xl border border-[#2d2d4e] bg-[#13131f] p-1">
            <button
              onClick={() => { setSelectedDifficulty(""); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                !selectedDifficulty
                  ? "bg-violet-600 text-white"
                  : "text-[#6b6b8a] hover:text-white"
              }`}
            >
              All
            </button>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => { setSelectedDifficulty(d === selectedDifficulty ? "" : d); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  selectedDifficulty === d
                    ? d === "easy" ? "bg-green-600/20 text-green-400"
                      : d === "medium" ? "bg-yellow-600/20 text-yellow-400"
                      : "bg-red-600/20 text-red-400"
                    : "text-[#6b6b8a] hover:text-white"
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
            className="rounded-xl border border-[#2d2d4e] bg-[#13131f] px-3 py-2 text-sm text-[#a0a0c0] transition focus:border-violet-500 focus:outline-none"
          >
            <option value="">All Companies</option>
            {COMPANIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Topic dropdown */}
          <select
            value={selectedTopic}
            onChange={(e) => { setSelectedTopic(e.target.value); setPage(1); }}
            className="rounded-xl border border-[#2d2d4e] bg-[#13131f] px-3 py-2 text-sm text-[#a0a0c0] transition focus:border-violet-500 focus:outline-none"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t.name} value={t.name}>{t.display_name}</option>
            ))}
          </select>

          {/* Active chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedDifficulty && (
                <span className="flex items-center gap-1 rounded-full border border-[#2d2d4e] bg-[#13131f] px-3 py-1 text-xs">
                  <DifficultyBadge difficulty={selectedDifficulty as "easy" | "medium" | "hard"} />
                  <button onClick={() => { setSelectedDifficulty(""); setPage(1); }} className="ml-1 text-[#6b6b8a] hover:text-white">×</button>
                </span>
              )}
              {selectedCompany && (
                <span className="flex items-center gap-1 rounded-full border border-[#2d2d4e] bg-[#13131f] px-3 py-1 text-xs capitalize text-[#a0a0c0]">
                  {selectedCompany}
                  <button onClick={() => { setSelectedCompany(""); setPage(1); }} className="ml-1 text-[#6b6b8a] hover:text-white">×</button>
                </span>
              )}
              {selectedTopic && (
                <span className="flex items-center gap-1 rounded-full border border-[#2d2d4e] bg-[#13131f] px-3 py-1 text-xs text-[#a0a0c0]">
                  {topics.find((t) => t.name === selectedTopic)?.display_name ?? selectedTopic}
                  <button onClick={() => { setSelectedTopic(""); setPage(1); }} className="ml-1 text-[#6b6b8a] hover:text-white">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#13131f]" />
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="py-20 text-center text-[#6b6b8a]">No problems found for this filter.</div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {problems.map((p) => (
                <ProblemCard key={p.id} problem={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl border border-[#2d2d4e] bg-[#13131f] px-4 py-2 text-sm text-[#a0a0c0] transition hover:border-violet-500/50 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-[#6b6b8a]">Page {page} of {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-[#2d2d4e] bg-[#13131f] px-4 py-2 text-sm text-[#a0a0c0] transition hover:border-violet-500/50 disabled:opacity-30"
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
