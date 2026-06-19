"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DifficultyBadge from "@/components/DifficultyBadge";
import HintAccordion from "@/components/HintAccordion";
import { fetchProblem } from "@/lib/problems";
import type { ProblemDetail } from "@/lib/problems";

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProblem(slug)
      .then(setProblem)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
          <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (notFound || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Problem not found</p>
          <button
            onClick={() => router.push("/problems")}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Back to problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Back to problems
        </button>

        {/* Title row */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {problem.title}
          </h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Topic tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {problem.topics.map((t) => (
            <span
              key={t.name}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                t.is_primary
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {t.display_name}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                Problem
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {problem.description}
              </p>
            </section>

            {/* Examples */}
            {problem.examples.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                  Examples
                </h2>
                <div className="space-y-4">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-md bg-gray-50 p-4 dark:bg-gray-900">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Example {i + 1}</p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Input:</span> {ex.input}
                      </p>
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-semibold">Output:</span> {ex.output}
                      </p>
                      {ex.explanation && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {ex.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Constraints */}
            {problem.constraints.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">
                  Constraints
                </h2>
                <ul className="space-y-1">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="text-sm font-mono text-gray-700 dark:text-gray-300">
                      • {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Companies */}
            {problem.companies.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                  Asked by
                </h2>
                <div className="flex flex-wrap gap-2">
                  {problem.companies.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs capitalize text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Hints */}
            {problem.hints.length > 0 && (
              <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Hints
                </h2>
                <HintAccordion hints={problem.hints} />
              </section>
            )}

            {/* Start solving CTA */}
            <button
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              onClick={() => alert("AI Mentor coming Day 6!")}
            >
              Ask AI Mentor →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
