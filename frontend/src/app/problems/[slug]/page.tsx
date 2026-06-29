"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DifficultyBadge from "@/components/DifficultyBadge";
import HintAccordion from "@/components/HintAccordion";
import MentorChat from "@/components/MentorChat";
import SubmitAttempt from "@/components/SubmitAttempt";
import { fetchProblem } from "@/lib/problems";
import { startSession, sendMessage } from "@/lib/mentor";
import { getStarterCode } from "@/lib/starterCode";
import type { Language } from "@/lib/starterCode";
import type { Outcome } from "@/lib/attempts";
import type { ProblemDetail } from "@/lib/problems";
import type { MentorMessage, MentorSession } from "@/lib/mentor";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

type Tab = "problem" | "hints";

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("problem");
  const [language, setLanguage] = useState<Language>("python");
  const [codePerLanguage, setCodePerLanguage] = useState<Record<string, string>>(
    () => ({ python: getStarterCode(slug, "python") })
  );
  const code = codePerLanguage[language] ?? getStarterCode(slug, language as Language);

  function setCode(val: string) {
    setCodePerLanguage((prev) => ({ ...prev, [language]: val }));
  }

  const [session, setSession] = useState<MentorSession | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);

  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [submittedOutcome, setSubmittedOutcome] = useState<Outcome | null>(null);

  function getElapsed() { return Math.floor((Date.now() - startTime) / 1000); }
  function handleAttemptSubmitted(outcome: Outcome) { setSubmittedOutcome(outcome); }

  useEffect(() => {
    fetchProblem(slug).then(setProblem).catch(() => setNotFound(true)).finally(() => setLoading(false));
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
    const userMsg: MentorMessage = { id: crypto.randomUUID(), role: "user", content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setMentorLoading(true);
    try {
      const aiMsg = await sendMessage(session.id, text);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const status = err?.response?.status;
      const errorContent =
        status === 429 ? "⏳ Rate limit reached. Please wait a moment and try again."
        : status === 502 ? "⚠️ AI service unavailable. Please try again shortly."
        : err?.response?.data?.detail ?? "Something went wrong.";
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: errorContent, created_at: new Date().toISOString() }]);
    } finally {
      setMentorLoading(false);
    }
  }

  function handleLanguageChange(lang: Language) {
    setLanguage(lang);
    setCodePerLanguage((prev) => ({ ...prev, [lang]: prev[lang] ?? getStarterCode(slug, lang) }));
  }

  async function handleSendWithCode() {
    if (!session) return;
    const currentCode = code.trim();
    if (!currentCode) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: "Please review my code.", created_at: new Date().toISOString() }]);
    setMentorLoading(true);
    try {
      const aiMsg = await sendMessage(session.id, "Please review my code and tell me what's wrong or what I can improve.", currentCode);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const status = err?.response?.status;
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        content: status === 429 ? "⏳ Rate limit reached. Please wait a moment." : "Something went wrong.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setMentorLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
          <p className="text-sm text-[#6b6b8a]">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (notFound || !problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d1a]">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">Problem not found</p>
          <button onClick={() => router.push("/problems")} className="mt-4 text-violet-400 hover:text-violet-300">
            ← Back to problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0d0d1a]">

      {/* Top navbar */}
      <header className="flex items-center gap-4 border-b border-[#2d2d4e] bg-[#0d0d1a] px-5 py-3">
        <button
          onClick={() => router.push("/problems")}
          className="flex items-center gap-1.5 text-sm text-[#6b6b8a] transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Problems
        </button>

        <div className="h-5 w-px bg-[#2d2d4e]" />

        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-semibold text-white">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="ml-auto flex flex-wrap gap-1.5">
          {problem.topics.map((t) => (
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
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <div className="flex w-[55%] flex-col overflow-hidden border-r border-[#2d2d4e]">

          {/* Tab bar */}
          <div className="flex border-b border-[#2d2d4e] bg-[#0d0d1a]">
            {(["problem", "hints"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "border-b-2 border-violet-500 text-violet-400"
                    : "text-[#6b6b8a] hover:text-white"
                }`}
              >
                {tab}
                {tab === "hints" && (
                  <span className="ml-1.5 rounded-full bg-[#2d2d4e] px-1.5 py-0.5 text-xs text-[#6b6b8a]">
                    {problem.hints.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto bg-[#0d0d1a] p-6">
            {activeTab === "problem" && (
              <div className="space-y-6">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#c0c0d8]">
                  {problem.description}
                </p>

                {problem.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-[#2d2d4e] bg-[#13131f] p-4">
                    <p className="mb-2 text-xs font-semibold text-[#6b6b8a]">Example {i + 1}</p>
                    <p className="font-mono text-sm text-[#c0c0d8]">
                      <span className="font-semibold text-white">Input:</span> {ex.input}
                    </p>
                    <p className="mt-1 font-mono text-sm text-[#c0c0d8]">
                      <span className="font-semibold text-white">Output:</span> {ex.output}
                    </p>
                    {ex.explanation && (
                      <p className="mt-2 text-xs text-[#6b6b8a]">{ex.explanation}</p>
                    )}
                  </div>
                ))}

                {problem.constraints.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Constraints</p>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="font-mono text-xs text-[#8080a0]">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem.companies.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6b6b8a]">Asked by</p>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.companies.map((c) => (
                        <span key={c} className="rounded-full border border-[#2d2d4e] bg-[#13131f] px-2.5 py-0.5 text-xs capitalize text-[#8080a0]">
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
                <p className="mb-4 text-sm text-[#6b6b8a]">
                  Reveal hints one at a time. Try the problem before using them.
                </p>
                <HintAccordion
                  hints={problem.hints}
                  onHintRevealed={() => setHintsUsed((h) => h + 1)}
                />
              </div>
            )}
          </div>

          {/* Code editor */}
          <div className="h-[42%] border-t border-[#2d2d4e] p-3 pb-2">
            <CodeEditor
              code={code}
              language={language}
              onChange={setCode}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Submit attempt */}
          <div className="border-t border-[#2d2d4e] px-3 py-2">
            {submittedOutcome ? (
              <div className={`rounded-xl px-4 py-2 text-center text-sm font-medium ${
                submittedOutcome === "solved"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : submittedOutcome === "partial"
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {submittedOutcome === "solved" ? "Great work! Attempt saved 🎉" : submittedOutcome === "partial" ? "Keep going! Attempt saved." : "Come back to this one!"}
              </div>
            ) : (
              problem && (
                <SubmitAttempt
                  problemId={problem.id}
                  problemSlug={slug}
                  language={language}
                  hintsUsed={hintsUsed}
                  hintTiersUsed={[]}
                  code={code}
                  elapsedSeconds={getElapsed()}
                  onSubmitted={handleAttemptSubmitted}
                />
              )
            )}
          </div>
        </div>

        {/* Right panel: AI Mentor */}
        <div className="flex w-[45%] flex-col overflow-hidden bg-[#0d0d1a] p-3">
          {!session ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-[#2d2d4e]">
              {/* Glow */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-600/10 text-4xl">
                🧠
                <div className="absolute inset-0 rounded-2xl bg-violet-600/5 blur-md" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">AI Mentor</p>
                <p className="mt-1 max-w-xs text-sm text-[#6b6b8a]">
                  Socratic hints, code reviews, and concept explanations — without being given the answer.
                </p>
              </div>
              <button
                onClick={handleStartMentor}
                disabled={sessionStarting}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:opacity-90 disabled:opacity-60"
              >
                {sessionStarting ? "Starting..." : "Start Mentor Session"}
              </button>
              <p className="text-xs text-[#4a4a6a]">Login required</p>
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
