"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NavAuth() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (!user) return;
      try {
        const data = await api.get("/api/users/me");
        setDbUser(data);
      } catch (err) {
        // Silently ignore network errors (e.g. during backend restarts)
        if (err instanceof TypeError) return;
        console.warn("NavAuth: could not load user profile", err);
      }
    };
    fetchDbUser();
    window.addEventListener("profile-updated", fetchDbUser);
    return () => window.removeEventListener("profile-updated", fetchDbUser);
  }, [user]);

  // Show nothing while Firebase resolves auth state (avoids flicker)
  if (loading) {
    return <div className="w-24 h-8 rounded-full bg-white/5 animate-pulse" />;
  }

  if (user) {
    const initials = (user.displayName || user.email || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-center gap-3">
        {/* Go to app shortcut */}
        <Link
          href="/discover"
          className="hidden md:flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Go to app
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Avatar dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[var(--border)] bg-white/5 hover:bg-white/10 transition-colors">
            {dbUser?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={dbUser.avatar} 
                alt="Avatar" 
                className="w-7 h-7 rounded-full object-cover border border-[var(--border)]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
              {dbUser?.name?.split(" ")[0] || user.displayName?.split(" ")[0] || "Me"}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--muted)]">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown panel */}
          <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[var(--border)] bg-[#131315] shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />

            {/* User info header */}
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <p className="text-sm font-medium truncate">{dbUser?.name || user.displayName || "Player"}</p>
              <p className="text-xs text-[var(--muted)] truncate mt-0.5">{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                View Profile
              </Link>
              <Link
                href="/discover"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Discover Players
              </Link>
              <Link
                href="/matches"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                My Matches
              </Link>
            </div>

            {/* Sign out */}
            <div className="border-t border-[var(--border)] py-1">
              <button
                onClick={async () => {
                  await logout();
                  router.refresh();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in — show Login / Sign up
  return (
    <>
      <Link href="/login" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors text-sm font-medium">
        Log in
      </Link>
      <Link
        href="/signup"
        className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-full hover:bg-gray-200 transition-transform active:scale-95 text-sm font-medium"
      >
        Sign up
      </Link>
    </>
  );
}
