"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/app/components/Logo";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/Toast";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  activeMatches: number;
  totalCommunities: number;
  pendingRequests: number;
  userGrowth: number;
}

interface Activity {
  type: string;
  action: string;
  user: string;
  city: string;
  details?: string;
  time: string;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a4 4 0 0 0-4 4v5a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
  </svg>
);

const IconCommunity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" />
    <path d="M6.5 17a5.5 5.5 0 0 1 11 0" />
    <circle cx="4" cy="11" r="2.5" />
    <path d="M1.5 20a3.5 3.5 0 0 1 7 0" />
    <circle cx="20" cy="11" r="2.5" />
    <path d="M15.5 20a3.5 3.5 0 0 1 7 0" />
  </svg>
);

const IconInbox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const IconUserPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconSwords = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" y1="14" x2="9" y2="18" />
    <line x1="7" y1="21" x2="9" y2="19" />
  </svg>
);

const IconFlag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, change, icon, color,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}) {
  const isPositive = change?.startsWith("+");
  return (
    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[var(--muted)]">{label}</div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {change && (
        <div className={`text-xs font-medium mt-2 ${isPositive ? "text-green-500" : "text-red-400"}`}>
          {change} from last month
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Activity icon + colour per type ─────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  const config: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    registration: {
      icon: <IconUserPlus />,
      bg: "bg-[var(--accent)]/10",
      text: "text-[var(--accent)]",
    },
    match: {
      icon: <IconSwords />,
      bg: "bg-green-500/10",
      text: "text-green-500",
    },
    community: {
      icon: <IconFlag />,
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
    },
  };
  const c = config[type] || { icon: <IconFlag />, bg: "bg-white/10", text: "text-[var(--muted)]" };
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
      {c.icon}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isNotAdmin, setIsNotAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsFetching(true);
      try {
        const [s, a] = await Promise.all([
          api.get<Stats>("/api/admin/stats"),
          api.get<Activity[]>("/api/admin/activity"),
        ]);
        setStats(s);
        setActivity(a);
      } catch (err: any) {
        if (err.message?.includes("Admin") || err.message?.includes("Forbidden")) {
          setIsNotAdmin(true);
        } else {
          showToast("Failed to load admin data", "error");
        }
      } finally {
        setIsFetching(false);
      }
    };
    if (!loading) {
      if (user) {
        fetchData();
      } else {
        setIsNotAdmin(true);
        setIsFetching(false);
      }
    }
  }, [user, loading]);

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isNotAdmin) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-[var(--muted)] text-sm mb-6">Your account doesn&apos;t have admin privileges. Contact the system administrator to get access.</p>
          <Link href="/discover" className="inline-block text-sm bg-white/10 hover:bg-white/20 text-[var(--foreground)] px-6 py-2.5 rounded-lg transition-colors">
            Back to App
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] flex flex-col bg-[var(--background)] p-4">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <Logo size={30} showText={false} />
          <span className="font-semibold tracking-tight text-sm">Admin Portal</span>
        </Link>
        <nav className="space-y-1 flex-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Users
          </Link>
        </nav>
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <Link href="/discover" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[var(--background)]">
          <h1 className="font-medium">Platform Overview</h1>
          <button
            onClick={async () => { setIsFetching(true); try { const [s, a] = await Promise.all([api.get("/api/admin/stats"), api.get("/api/admin/activity")]); setStats(s); setActivity(a); } catch {} finally { setIsFetching(false); } }}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0a0a0c]">
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  change={`+${stats.userGrowth}%`}
                  icon={<IconUsers />}
                  color="bg-[var(--accent)]/10 text-[var(--accent)]"
                />
                <StatCard
                  label="Active Matches"
                  value={stats.activeMatches.toLocaleString()}
                  icon={<IconTrophy />}
                  color="bg-green-500/10 text-green-500"
                />
                <StatCard
                  label="Communities"
                  value={stats.totalCommunities.toLocaleString()}
                  icon={<IconCommunity />}
                  color="bg-yellow-500/10 text-yellow-500"
                />
                <StatCard
                  label="Pending Requests"
                  value={stats.pendingRequests.toLocaleString()}
                  icon={<IconInbox />}
                  color="bg-orange-500/10 text-orange-400"
                />
              </div>
            )}

            {/* Recent Activity */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Recent Platform Activity</h2>
                <Link href="/admin/users" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]">
                  View all users →
                </Link>
              </div>
              <div className="space-y-2">
                {activity.length > 0 ? activity.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-transparent hover:border-[var(--border)] transition-colors">
                    <div className="flex items-center gap-3">
                      <ActivityIcon type={log.type} />
                      <div>
                        <div className="font-medium text-sm">{log.action}</div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">
                          by {log.user}
                          {log.city && ` • ${log.city}`}
                          {log.details && ` • ${log.details}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--muted)] shrink-0">{timeAgo(log.time)}</div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-[var(--muted)] text-sm">No recent activity</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
