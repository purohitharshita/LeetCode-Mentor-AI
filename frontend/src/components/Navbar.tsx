"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Problems", href: "/problems" },
  { label: "Profile", href: "/profile" },
];

const HIDE_ON = ["/login", "/register", "/onboarding"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDE_ON.includes(pathname) || pathname === "/") return null;

  function handleLogout() {
    clearTokens();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-[#2d2d4e] bg-[#0d0d1a]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">

        {/* Logo */}
        <Link href="/problems" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20 text-base">
            🧠
          </div>
          <span className="text-sm font-semibold text-white">LeetCode Mentor AI</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                pathname.startsWith(link.href)
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-[#6b6b8a] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-3 h-5 w-px bg-[#2d2d4e]" />

          <button
            onClick={handleLogout}
            className="ml-3 rounded-lg border border-[#2d2d4e] px-3 py-1.5 text-xs text-[#6b6b8a] transition hover:border-red-500/50 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
