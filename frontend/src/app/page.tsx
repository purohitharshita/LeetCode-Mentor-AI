import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d0d1a] px-4">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 h-64 w-64 rounded-full bg-purple-600/10 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/10 px-4 py-1.5 text-xs font-medium text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI-Powered DSA Interview Prep
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Crack Interviews{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-violet-400 bg-clip-text text-transparent">
            Faster
          </span>{" "}
          with Adaptive AI
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base text-[#8080a0]">
          Your personal AI mentor for DSA mastery. Get Socratic hints, code reviews,
          and personalized problem recommendations — all without being handed the answer.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:opacity-90 sm:w-auto"
          >
            Start for free
          </Link>
          <Link
            href="/problems"
            className="w-full rounded-xl border border-[#2d2d4e] bg-[#13131f] px-7 py-3 text-sm font-semibold text-[#a0a0c0] transition hover:border-violet-500/50 hover:text-white sm:w-auto"
          >
            Browse Problems →
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            "🧠 Socratic AI Mentor",
            "📊 Topic Mastery Tracking",
            "🎯 Company-Filtered Problems",
            "💻 Monaco Code Editor",
          ].map((f) => (
            <span
              key={f}
              className="rounded-full border border-[#2d2d4e] bg-[#13131f] px-4 py-1.5 text-xs text-[#8080a0]"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-10 flex items-center justify-center gap-8 text-xs text-[#6b6b8a]">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">47</p>
            <p>Problems</p>
          </div>
          <div className="h-8 w-px bg-[#2d2d4e]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">18</p>
            <p>DSA Topics</p>
          </div>
          <div className="h-8 w-px bg-[#2d2d4e]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">5</p>
            <p>Languages</p>
          </div>
          <div className="h-8 w-px bg-[#2d2d4e]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">Free</p>
            <p>Powered by Groq</p>
          </div>
        </div>
      </div>
    </main>
  );
}
