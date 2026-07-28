"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import Logo from "@/app/components/Logo";

const NAV_ITEMS = [
  {
    href: "/discover",
    label: "Discover",
    icon: (
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:drop-shadow-[0_0_6px_rgba(94,106,210,0.6)] transition-all"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    href: "/matches",
    label: "My Matches",
    icon: (
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:drop-shadow-[0_0_6px_rgba(94,106,210,0.6)] transition-all"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
        <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
      </svg>
    ),
  },
  {
    href: "/messages",
    label: "Messages",
    icon: (
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:drop-shadow-[0_0_6px_rgba(94,106,210,0.6)] transition-all"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/communities",
    label: "Communities",
    icon: (
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:drop-shadow-[0_0_6px_rgba(94,106,210,0.6)] transition-all"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchDbUser = async () => {
      if (!user) return;
      try {
        const data = await api.get("/api/users/me");
        setDbUser(data);
      } catch (err) {
        // Silently ignore network errors (e.g. during backend restarts)
        if (err instanceof TypeError) return;
        console.warn("Sidebar: could not load user profile", err);
      }
    };
    fetchDbUser();
    window.addEventListener("profile-updated", fetchDbUser);
    return () => window.removeEventListener("profile-updated", fetchDbUser);
  }, [user]);

  // Poll unread message count every 30 seconds
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const data = await api.get<{ count: number }>("/api/messages/unread");
        setUnreadCount(data.count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <aside className="w-64 border-r border-[var(--border)] hidden md:flex flex-col bg-[var(--background)] p-4 animate-fade-in">
      <Link href="/" className="flex items-center mb-8 px-2">
        <Logo size={36} showText={true} />
      </Link>

      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isMessages = item.href === "/messages";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-white/5 text-[var(--foreground)] font-medium"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
              }`}
            >
              <span className="relative">
                {item.icon}
                {isMessages && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--accent)] rounded-full border border-[var(--background)] text-[8px] text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {item.label}
              {isMessages && unreadCount > 0 && (
                <span className="ml-auto text-[10px] bg-[var(--accent)] text-white px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section with profile and logout */}
      <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-1">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === "/profile"
              ? "bg-white/5 text-[var(--foreground)] font-medium"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5"
          }`}
        >
          {dbUser?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={dbUser.avatar} 
              alt="Avatar" 
              className="w-6 h-6 rounded-full object-cover border border-[var(--border)]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center text-white text-[10px] font-bold">
              {(dbUser?.name || user?.displayName || user?.email || "U").charAt(0)}
            </div>
          )}
          <span className="truncate text-sm">{dbUser?.name || user?.displayName || user?.email || "Profile"}</span>
        </Link>
        {user && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/5 transition-colors text-left text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
