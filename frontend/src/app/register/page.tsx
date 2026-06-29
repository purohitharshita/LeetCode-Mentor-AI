"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { register, saveTokens } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await register(email, name, password);
      saveTokens(res.access_token, res.refresh_token);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not create account");
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg">🧠</div>
        <span className="text-sm font-semibold text-white">LeetCode Mentor AI</span>
      </div>

      <h2 className="text-2xl font-bold text-white">Create your account</h2>
      <p className="mt-1 text-sm text-[#6b6b8a]">Start practicing with a mentor that adapts to you</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {[
          { label: "Name", value: name, set: setName, type: "text", placeholder: "Your name" },
          { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@example.com" },
          { label: "Password", value: password, set: setPassword, type: "password", placeholder: "At least 8 characters" },
        ].map((f) => (
          <div key={f.label}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#6b6b8a]">
              {f.label}
            </label>
            <input
              type={f.type} required value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.placeholder}
              className="w-full rounded-xl border border-[#2d2d4e] bg-[#13131f] px-4 py-3 text-sm text-white placeholder-[#4a4a6a] transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
            />
          </div>
        ))}

        <button
          type="submit" disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6b6b8a]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-violet-400 hover:text-violet-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
