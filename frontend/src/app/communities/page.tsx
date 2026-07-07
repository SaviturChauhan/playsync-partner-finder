"use client";

import Link from "next/link";
import { useState } from "react";

// Mock Communities Data
const MOCK_COMMUNITIES = [
  { id: 1, name: "Omaxe Heights Society", location: "Vibhuti Khand, Lucknow", members: 142, type: "Society", games: ["Badminton", "Table Tennis", "Chess"] },
  { id: 2, name: "Jaipur Weekend Smashers", location: "Malviya Nagar, Jaipur", members: 85, type: "Club", games: ["Tennis", "Badminton"] },
  { id: 3, name: "Gomti Nagar Chess Club", location: "Gomti Nagar, Lucknow", members: 56, type: "Club", games: ["Chess"] },
];

export default function Communities() {
  const [activeTab, setActiveTab] = useState("my");

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
          <Link href="/communities" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Communities
          </Link>
          <Link href="/matches" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            My Matches
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">Communities</h1>
          <button className="text-sm bg-[var(--accent)] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors">
            Create Community
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 border-b border-[var(--border)] mb-8">
              <button 
                onClick={() => setActiveTab("my")}
                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "my" ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                My Communities
                {activeTab === "my" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab("discover")}
                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "discover" ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Discover Communities
                {activeTab === "discover" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full"></div>}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
              {MOCK_COMMUNITIES.map(community => (
                <div key={community.id} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{community.name}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-[var(--muted)]">{community.type}</span>
                  </div>
                  <div className="text-sm text-[var(--muted)] mb-4 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {community.location}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {community.games.map(game => (
                      <span key={game} className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] bg-white/5">{game}</span>
                    ))}
                  </div>
                  <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {community.members} Members
                    </div>
                    <button className="text-sm text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors">
                      {activeTab === "my" ? "View Board" : "Join"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
