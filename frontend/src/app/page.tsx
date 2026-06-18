export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          LeetCode Mentor AI
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          AI-powered DSA interview preparation
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-sm text-gray-500">Bootstrap complete</span>
        </div>
      </div>
    </main>
  );
}
