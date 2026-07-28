"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/Toast";

export default function Matches() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const data = await api.get("/api/requests/history");
        setUpcoming(data.upcoming || []);
        setPast(data.past || []);
      } catch (err) {
        // Silently ignore network errors (e.g. during backend restarts)
        if (!(err instanceof TypeError)) console.warn("Matches: could not load history", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleCancel = async (requestId: string) => {
    try {
      await api.delete(`/api/requests/${requestId}`);
      setUpcoming(prev => prev.filter(m => m._id !== requestId));
      showToast("Match cancelled", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to cancel", "error");
    }
  };

  const getPartnerName = (match: any) => {
    const sender = match.senderId;
    const receiver = match.receiverId;
    if (sender?.firebaseUid === user?.uid || sender?._id === user?.uid) {
      return receiver?.name || "Player";
    }
    return sender?.name || "Player";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">Match History</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20 md:pb-10">
          <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
            
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="p-6 rounded-xl border border-[var(--border)] bg-white/[0.02] animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/4 mb-3" />
                    <div className="h-6 bg-white/10 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Upcoming Matches */}
                <section>
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                    Upcoming Matches
                    {upcoming.length > 0 && (
                      <span className="text-xs font-normal text-[var(--muted)] bg-white/5 px-2 py-0.5 rounded-full">{upcoming.length}</span>
                    )}
                  </h2>
                  {upcoming.length > 0 ? (
                    <div className="space-y-4">
                      {upcoming.map(match => (
                        <div key={match._id} className="p-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_0_15px_rgba(94,106,210,0.1)]">
                          <div>
                            <div className="text-sm font-medium text-[var(--accent)] mb-1">
                              {formatDate(match.scheduledTime)}, {formatTime(match.scheduledTime)}
                            </div>
                            <h3 className="font-semibold text-lg">{match.game} with {getPartnerName(match)}</h3>
                            {match.venueId && (
                              <div className="text-sm text-[var(--muted)] mt-1 flex items-center gap-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {match.venueId.name}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3 shrink-0">
                            <button 
                              onClick={() => handleCancel(match._id)}
                              className="px-4 py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-[var(--border)] bg-white/[0.02] text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_15px_rgba(94,106,210,0.15)] bg-black/20">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                        </svg>
                      </div>
                      <p className="text-[var(--muted)]">No upcoming matches</p>
                      <p className="text-xs text-[var(--muted)] mt-1">Send a play request to get started!</p>
                    </div>
                  )}
                </section>

                {/* Past Matches */}
                <section>
                  <h2 className="text-xl font-semibold mb-6 text-[var(--muted)]">Past Matches</h2>
                  {past.length > 0 ? (
                    <div className="space-y-3">
                      {past.map((match, idx) => (
                        <div key={match._id} className="p-4 rounded-xl border border-[var(--border)] bg-white/[0.02] flex items-center justify-between animate-slide-up hover:bg-white/[0.04] transition-colors" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <div className="flex items-center gap-4 md:gap-6 w-full">
                            <div className="w-20 md:w-24 shrink-0 text-sm text-[var(--muted)]">{formatDate(match.scheduledTime)}</div>
                            <div className="w-1/4 shrink-0 font-medium">{match.game}</div>
                            <div className="w-1/4 shrink-0 text-[var(--muted)]">{getPartnerName(match)}</div>
                            <div className="hidden md:block flex-1 text-sm text-[var(--muted)] truncate">
                              {match.venueId?.name || "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-[var(--border)] bg-white/[0.02] text-center">
                      <p className="text-[var(--muted)]">No past matches yet</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
