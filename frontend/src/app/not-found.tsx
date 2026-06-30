import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d1a] px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/10 blur-[80px]" />
      </div>
      <div className="relative text-center">
        <p className="text-8xl font-bold text-[#2d2d4e]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-[#6b6b8a]">The page you're looking for doesn't exist.</p>
        <Link
          href="/problems"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to Problems
        </Link>
      </div>
    </div>
  );
}
