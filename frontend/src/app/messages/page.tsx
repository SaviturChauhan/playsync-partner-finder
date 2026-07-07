"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Mock Play Requests (Inbox)
const INITIAL_REQUESTS = [
  { id: 1, from: "Rahul S.", game: "Badminton", venue: "BBD Badminton Academy", time: "Tomorrow, 6:00 PM", status: "pending", message: "Hey, saw you're an advanced player. Up for a match?" },
  { id: 2, from: "Neha K.", game: "Table Tennis", venue: "Clubhouse - Omaxe Heights", time: "Today, 8:00 PM", status: "pending", message: "Need a partner for TT tonight!" },
  { id: 3, from: "Vikram R.", game: "Tennis", venue: "SMS Stadium Complex", time: "Saturday, 7:00 AM", status: "accepted", message: "Perfect, see you at court 2." },
];

export default function Messages() {
  const [requests, setRequests] = useState<Array<Record<string, any>>>(INITIAL_REQUESTS);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let token = "dummy";
        try {
          const { auth } = await import("@/lib/firebase");
          if (auth.currentUser) token = await auth.currentUser.getIdToken();
        } catch(e) {}

        const res = await fetch("http://127.0.0.1:5001/api/requests", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            // map backend structure to UI structure
            setRequests(data.map((req: Record<string, any>) => ({
              id: req._id,
              from: req.senderId?.name || "Player",
              game: req.game,
              venue: req.venueId?.name || "Venue",
              time: req.scheduledTime,
              status: req.status,
              message: req.message
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch requests", err);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (id: number | string, action: "accepted" | "declined") => {
    // optimistic update
    setRequests(requests.map(req => req.id === id ? { ...req, status: action } : req));
    
    try {
      let token = "dummy";
      try {
        const { auth } = await import("@/lib/firebase");
        if (auth.currentUser) token = await auth.currentUser.getIdToken();
      } catch(e) {}

      await fetch(`http://127.0.0.1:5001/api/requests/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: action })
      });
    } catch (err) {
      console.error(err);
    }
  };

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
          <Link href="/matches" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            My Matches
          </Link>
          <Link href="/messages" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Messages
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">Inbox & Play Requests</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-6">
            {requests.map((req, index) => (
              <div key={req.id} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#222] border border-[#333] flex items-center justify-center font-bold shrink-0">{req.from.charAt(0)}</div>
                  <div>
                    <h3 className="font-medium text-lg flex items-center gap-2">
                      Play Request from {req.from}
                      {req.status === "pending" && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Pending</span>}
                      {req.status === "accepted" && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">Accepted</span>}
                      {req.status === "declined" && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">Declined</span>}
                    </h3>
                    <div className="text-sm text-[var(--muted)] mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {req.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {req.venue}
                      </span>
                    </div>
                    <div className="mt-3 text-sm bg-white/5 p-3 rounded-lg border border-[var(--border)]">
                      &quot;{req.message}&quot;
                    </div>
                  </div>
                </div>

                {req.status === "pending" && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <button onClick={() => handleAction(req.id, "accepted")} className="flex-1 md:w-32 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleAction(req.id, "declined")} className="flex-1 md:w-32 py-2 bg-transparent hover:bg-red-500/10 hover:text-red-500 border border-[var(--border)] hover:border-red-500/50 text-[var(--foreground)] text-sm font-medium rounded-lg transition-colors">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
