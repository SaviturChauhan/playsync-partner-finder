"use client";

import Link from "next/link";

// Mock Match History Data
const MATCH_HISTORY = [
  { id: 1, date: "Today", time: "6:00 PM", partner: "Rahul S.", game: "Badminton", venue: "BBD Badminton Academy, Lucknow", result: "Upcoming", type: "upcoming" },
  { id: 2, date: "Yesterday", time: "7:30 PM", partner: "Priya M.", game: "Chess", venue: "Clubhouse - Omaxe Heights, Lucknow", result: "Won 2-1", type: "past" },
  { id: 3, date: "July 2, 2026", time: "7:00 AM", partner: "Vikram R.", game: "Tennis", venue: "SMS Stadium Complex, Jaipur", result: "Lost 0-2", type: "past" },
  { id: 4, date: "June 28, 2026", time: "6:00 PM", partner: "Neha K.", game: "Table Tennis", venue: "C-Scheme Arena, Jaipur", result: "Won 3-0", type: "past" },
];

export default function Matches() {
  const upcomingMatches = MATCH_HISTORY.filter(m => m.type === "upcoming");
  const pastMatches = MATCH_HISTORY.filter(m => m.type === "past");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar (Linear Style) */}
      <aside className="w-64 border-r border-[var(--border)] hidden md:flex flex-col bg-[var(--background)] p-4 animate-fade-in">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center font-bold text-white text-xs">P</div>
          <span className="font-semibold tracking-tight text-[var(--foreground)]">PlaySync</span>
        </Link>
        <nav className="space-y-1">
          <Link href="/discover" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Discover
          </Link>
          <Link href="/matches" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            My Matches
          </Link>
          <Link href="/messages" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Messages
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">Match History</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            
            {/* Upcoming Matches */}
            <section>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                Upcoming Matches
              </h2>
              <div className="space-y-4">
                {upcomingMatches.map(match => (
                  <div key={match.id} className="p-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_15px_rgba(94,106,210,0.1)]">
                    <div>
                      <div className="text-sm font-medium text-[var(--accent)] mb-1">{match.date}, {match.time}</div>
                      <h3 className="font-semibold text-lg">{match.game} with {match.partner}</h3>
                      <div className="text-sm text-[var(--muted)] mt-1 flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {match.venue}
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button className="px-4 py-2 border border-[var(--border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)] text-sm font-medium rounded-lg transition-colors">Reschedule</button>
                      <button className="px-4 py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Past Matches */}
            <section>
              <h2 className="text-xl font-semibold mb-6 text-[var(--muted)]">Past Matches</h2>
              <div className="space-y-3">
                {pastMatches.map((match, idx) => (
                  <div key={match.id} className="p-4 rounded-xl border border-[var(--border)] bg-white/[0.02] flex items-center justify-between animate-slide-up hover:bg-white/[0.04] transition-colors" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="flex items-center gap-6 w-full">
                      <div className="w-24 shrink-0 text-sm text-[var(--muted)]">{match.date}</div>
                      <div className="w-1/4 shrink-0 font-medium">{match.game}</div>
                      <div className="w-1/4 shrink-0 text-[var(--muted)]">{match.partner}</div>
                      <div className="w-1/4 shrink-0 hidden md:block text-sm text-[var(--muted)] truncate">{match.venue}</div>
                      <div className="flex-1 text-right">
                        <span className={`text-sm font-medium px-2 py-1 rounded bg-white/5 border border-[var(--border)] ${match.result.startsWith('Won') ? 'text-green-500' : 'text-[var(--muted)]'}`}>
                          {match.result}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
          </div>
        </div>
      </main>
    </div>
  );
}
