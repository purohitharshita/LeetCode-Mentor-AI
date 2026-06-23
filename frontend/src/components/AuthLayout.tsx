interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-12 text-white lg:flex">
        {/* Decorative blobs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-lg font-bold">
              🧠
            </div>
            <span className="text-lg font-semibold">LeetCode Mentor AI</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Practice with a mentor,
            <br />
            not a checklist.
          </h1>
          <p className="max-w-md text-blue-100">
            Personalized hints, weakness tracking, and an AI mentor that
            teaches you to think — not just memorize solutions.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Tiered hints that never give the answer away",
              "Topic mastery scores that show real progress",
              "Recommendations tailored to your target companies",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-blue-50">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  ✓
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-blue-200">
          Built with FastAPI, Next.js, and Google Groq
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 dark:bg-gray-950 lg:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
