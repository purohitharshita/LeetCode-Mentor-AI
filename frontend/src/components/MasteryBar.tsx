"use client";

import { useEffect, useState } from "react";
import { fetchMastery } from "@/lib/attempts";
import type { TopicMastery } from "@/lib/attempts";

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75 ? "bg-green-500" :
    score >= 50 ? "bg-yellow-500" :
    score >= 25 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2d2d4e]">
        <div className={`h-1.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-white">{score}</span>
    </div>
  );
}

export default function MasteryBar() {
  const [mastery, setMastery] = useState<TopicMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchMastery().then(setMastery).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || mastery.length === 0) return null;

  const practiced = mastery.filter((m) => m.problems_attempted > 0);
  if (practiced.length === 0) return null;

  const topWeak = [...practiced].sort((a, b) => a.mastery_score - b.mastery_score).slice(0, 3);
  const avgScore = Math.round(practiced.reduce((s, m) => s + m.mastery_score, 0) / practiced.length);

  return (
    <div className="rounded-2xl border border-[#2d2d4e] bg-[#13131f] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#6b6b8a]">Mastery Score</p>
            <p className="text-2xl font-bold text-white">
              {avgScore}
              <span className="text-sm font-normal text-[#6b6b8a]">/100</span>
            </p>
          </div>
          <div className="h-10 w-px bg-[#2d2d4e]" />
          <div className="flex flex-wrap gap-4">
            {topWeak.map((m) => (
              <div key={m.topic_name} className="min-w-[120px]">
                <p className="mb-1 text-xs text-[#6b6b8a]">{m.topic_display_name}</p>
                <ScoreBar score={m.mastery_score} />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-violet-400 hover:text-violet-300"
        >
          {open ? "Hide" : "Show all"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 border-t border-[#2d2d4e] pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...practiced]
            .sort((a, b) => b.mastery_score - a.mastery_score)
            .map((m) => (
              <div key={m.topic_name}>
                <div className="flex justify-between">
                  <p className="text-xs text-[#a0a0c0]">{m.topic_display_name}</p>
                  <p className="text-xs text-[#6b6b8a]">{m.problems_solved}/{m.problems_attempted}</p>
                </div>
                <ScoreBar score={m.mastery_score} />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
