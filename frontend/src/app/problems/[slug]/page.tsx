"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DifficultyBadge from "@/components/DifficultyBadge";
import HintAccordion from "@/components/HintAccordion";
import MentorChat from "@/components/MentorChat";
import { fetchProblem } from "@/lib/problems";
import { startSession, sendMessage } from "@/lib/mentor";
import type { ProblemDetail } from "@/lib/problems";
import type { MentorMessage, MentorSession } from "@/lib/mentor";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

type Tab = "problem" | "hints";

const STARTER_CODE: Record<string, string> = {
  python: "class Solution:\n    def solve(self):\n        pass\n",
};

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("problem");
  const [code, setCode] = useState(STARTER_CODE.python);
  const [language, setLanguage] = useState("python");

  const [session, setSession] = useState<MentorSession | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);

  useEffect(() => {
    fetchProblem(slug)
      .then(setProblem)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleStartMentor() {
    if (!problem || session) return;
    setSessionStarting(true);
    try {
      const s = await startSession(problem.id);
      setSession(s);
      setMessages(s.messages);
    } catch {
      alert("Please log in to use the AI Mentor");
    } finally {
      setSessionStarting(false);
    }
  }

  async function handleSend(text: string) {
    if (!session) return;
    const userMsg: MentorMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMentorLoading(true);
    try {
      const aiMsg = await sendMessage(session.id, text);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      const errorContent =
        status === 429
          ? "⏳ Gemini rate limit reached. Please wait a minute and try again."
          : status === 502
          ? "⚠️ AI service is temporarily unavailable. Please try again shortly."
          : detail ?? "Something went wrong. Please try again.";

      const errMsg: MentorMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorContent,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setMentorLoading(false);
    }
  }

  async function handleSendWithCode() {
    if (!session || !code.trim()) return;
    await handleSend("Can you review my code and tell me what's wrong or what I can improve?");
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (notFound || !problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Problem not found</p>
          <button onClick={() => router.push("/problems")} className="mt-4 text-blue-600 hover:underline">
            ← Back to problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top navbar */}
      <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-5 py-3 dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => router.push("/problems")}
          className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Problems
        </button>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="ml-auto flex flex-wrap gap-1.5">
          {problem.topics.map((t) => (
            <span
              key={t.name}
              className={`rounded-full px-2 py-0.5 text-xs ${
                t.is_primary
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {t.display_name}
            </span>
          ))}
        </div>
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel: problem + editor */}
        <div className="flex w-[55%] flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700">

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {(["problem", "hints"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab}
                {tab === "hints" && (
                  <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                    {problem.hints.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto bg-white p-6 dark:bg-gray-900">
            {activeTab === "problem" && (
              <div className="space-y-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {problem.description}
                </p>

                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="mb-2 text-xs font-semibold text-gray-400">Example {i + 1}</p>
                    <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Input:</span> {ex.input}
                    </p>
                    <p className="mt-1 font-mono text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Output:</span> {ex.output}
                    </p>
                    {ex.explanation && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {problem.constraints.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Constraints
                    </p>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem.companies.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Asked by
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.companies.map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs capitalize text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "hints" && (
              <div>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Reveal hints one at a time. Try the problem before using them.
                </p>
                <HintAccordion hints={problem.hints} />
              </div>
            )}
          </div>

          {/* Code editor */}
          <div className="h-[42%] border-t border-gray-200 p-3 dark:border-gray-700">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>

        {/* Right panel: AI Mentor */}
        <div className="flex w-[45%] flex-col overflow-hidden bg-gray-50 p-3 dark:bg-gray-950">
          {!session ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-900/20">
                🧠
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white">AI Mentor</p>
                <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                  Get personalized hints, code reviews, and concept explanations — without being given the answer.
                </p>
              </div>
              <button
                onClick={handleStartMentor}
                disabled={sessionStarting}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {sessionStarting ? "Starting..." : "Start Mentor Session"}
              </button>
              <p className="text-xs text-gray-400">Login required</p>
            </div>
          ) : (
            <MentorChat
              messages={messages}
              onSend={handleSend}
              loading={mentorLoading}
              hasCode={code.trim().length > 30}
              onSendWithCode={handleSendWithCode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
