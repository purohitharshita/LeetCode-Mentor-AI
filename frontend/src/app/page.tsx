import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-lg">
            🧠
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          LeetCode Mentor AI
        </h1>
        <p className="mt-3 max-w-md text-gray-500 dark:text-gray-400">
          An AI-powered DSA mentor that adapts to you — personalized hints, weakness tracking,
          and guidance that teaches you to think, not memorize.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            Get started for free
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:w-auto"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-400">
          <span>47 problems</span>
          <span>·</span>
          <span>18 DSA topics</span>
          <span>·</span>
          <span>Powered by Gemini</span>
        </div>
      </div>
    </main>
  );
}
