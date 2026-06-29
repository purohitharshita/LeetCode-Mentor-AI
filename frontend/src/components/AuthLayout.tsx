interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#0d0d1a]">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #0d0d1a 50%, #1a0a2e 100%)" }}>

        {/* Glow blobs */}
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/30 blur-[100px]" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-purple-600/20 blur-[60px]" />
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-[40px]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/30 text-lg backdrop-blur">
            🧠
          </div>
          <span className="text-sm font-semibold text-white">LeetCode Mentor AI</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Your AI companion
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              for DSA mastery
            </span>
          </h1>
          <p className="max-w-sm text-[#8080a0]">
            Socratic hints that teach you to think. Progress tracking that shows where you're weak.
            Personalized recommendations for your target companies.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Tiered hints — never gives the answer away",
              "Topic mastery scores updated after every attempt",
              "Company-specific problem recommendations",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-[#a0a0c0]">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs text-violet-400">
                  ✓
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#6b6b8a]">
          Built with FastAPI, Next.js, and Groq
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-[#0d0d1a] px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
