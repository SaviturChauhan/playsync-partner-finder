"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] flex flex-col bg-[var(--background)] p-4">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-white text-xs">A</div>
          <span className="font-semibold tracking-tight text-[var(--foreground)]">Admin Portal</span>
        </Link>
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Users
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0 bg-[var(--background)]">
          <h1 className="font-medium">Platform Overview</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#0a0a0c]">
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: "1,248", change: "+12%" },
                { label: "Active Matches", value: "342", change: "+5%" },
                { label: "Communities", value: "56", change: "+2%" },
                { label: "Reports", value: "3", change: "-50%", good: true },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                  <div className="text-sm text-[var(--muted)] mb-2">{stat.label}</div>
                  <div className="text-3xl font-bold flex items-end gap-3">
                    {stat.value}
                    <span className={`text-xs font-medium pb-1 ${stat.good || stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--background)]">
              <h2 className="text-lg font-semibold mb-6">Recent Platform Activity</h2>
              <div className="space-y-4">
                {[
                  { action: "New user registration", user: "Sneha V.", city: "Lucknow", time: "2 mins ago" },
                  { action: "Community Created", user: "Rahul S.", city: "Lucknow", time: "15 mins ago", details: "Gomti Nagar Chess Club" },
                  { action: "Match Completed", user: "Vikram R.", city: "Jaipur", time: "1 hour ago", details: "Tennis at SMS Stadium" },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-transparent hover:border-[var(--border)] transition-colors">
                    <div>
                      <div className="font-medium">{log.action}</div>
                      <div className="text-sm text-[var(--muted)] mt-1">by {log.user} • {log.city} {log.details && `• ${log.details}`}</div>
                    </div>
                    <div className="text-sm text-[var(--muted)]">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
