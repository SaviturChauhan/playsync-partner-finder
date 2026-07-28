"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";
import Select from "@/app/components/Select";
import { api } from "@/lib/api";
import { useToast } from "@/lib/Toast";

interface Community {
  _id: string;
  name: string;
  description: string;
  location: string;
  city: string;
  type: string;
  games: string[];
  members: string[];
  admin: { _id: string; name: string };
}

const GAME_OPTIONS = ["Badminton", "Tennis", "Chess", "Table Tennis", "Cricket", "Football", "Basketball", "Carrom", "Volleyball", "Archery/Shooting"];

export default function Communities() {
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast } = useToast();

  // Create modal state
  const [form, setForm] = useState({
    name: "", description: "", location: "", city: "", type: "Club", games: [] as string[],
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        const [mine, all] = await Promise.allSettled([
          api.get("/api/communities/mine"),
          api.get("/api/communities"),
        ]);
        if (mine.status === "fulfilled") setMyCommunities(mine.value);
        if (all.status === "fulfilled") setAllCommunities(all.value);
      } catch (err) {
        console.error("Failed to fetch communities", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleJoin = async (communityId: string) => {
    try {
      await api.post(`/api/communities/${communityId}/join`);
      const joined = allCommunities.find(c => c._id === communityId);
      if (joined) setMyCommunities(prev => [...prev, joined]);
      showToast("Joined community!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to join", "error");
    }
  };

  const handleLeave = async (communityId: string) => {
    try {
      await api.post(`/api/communities/${communityId}/leave`);
      setMyCommunities(prev => prev.filter(c => c._id !== communityId));
      showToast("Left community", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to leave", "error");
    }
  };

  const toggleFormGame = (game: string) => {
    setForm(prev => ({
      ...prev,
      games: prev.games.includes(game) ? prev.games.filter(g => g !== game) : [...prev.games, game],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const newCommunity = await api.post<Community>("/api/communities", form);
      setMyCommunities(prev => [newCommunity, ...prev]);
      setAllCommunities(prev => [newCommunity, ...prev]);
      setShowCreateModal(false);
      setForm({ name: "", description: "", location: "", city: "", type: "Club", games: [] });
      showToast("Community created!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to create community", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const isMember = (communityId: string) => myCommunities.some(c => c._id === communityId);

  const communities = activeTab === "my" ? myCommunities : allCommunities;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">Communities</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm bg-[var(--accent)] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            + Create
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20 md:pb-10">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-[var(--border)] mb-8">
              {(["my", "discover"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors relative capitalize ${activeTab === tab ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  {tab === "my" ? "My Communities" : "Discover Communities"}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full" />}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] animate-pulse h-48" />
                ))}
              </div>
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                {communities.map(community => (
                  <div key={community._id} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{community.name}</h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-[var(--muted)]">
                        {community.type}
                      </span>
                    </div>

                    {community.description && (
                      <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2">{community.description}</p>
                    )}

                    <div className="text-sm text-[var(--muted)] mb-4 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {community.location || community.city}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {community.games.map(game => (
                        <span key={game} className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] bg-white/5">
                          {game}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                      <div className="text-sm font-medium text-[var(--muted)] flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {community.members?.length || 0} Members
                      </div>
                      {isMember(community._id) ? (
                        <button
                          onClick={() => handleLeave(community._id)}
                          className="text-sm text-red-400 font-medium hover:text-red-300 transition-colors"
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoin(community._id)}
                          className="text-sm text-[var(--accent)] font-medium hover:text-[var(--accent-hover)] transition-colors"
                        >
                          Join →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_20px_rgba(94,106,210,0.15)] bg-black/20">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <p className="text-[var(--muted)]">
                  {activeTab === "my" ? "You haven't joined any communities yet." : "No communities found."}
                </p>
                {activeTab === "my" && (
                  <button
                    onClick={() => setActiveTab("discover")}
                    className="mt-3 text-sm text-[var(--accent)] hover:underline"
                  >
                    Discover communities →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg bg-[#161618] border border-[var(--border)] rounded-2xl shadow-2xl animate-slide-up overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Create Community</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Community Name *</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Gomti Nagar Chess Club"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Description</label>
                  <textarea
                    rows={2} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="What is this community about?"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">Location *</label>
                    <input
                      type="text" required value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="Neighbourhood"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">City *</label>
                    <input
                      type="text" required value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                      placeholder="Lucknow"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Type</label>
                  <Select
                    value={form.type}
                    onChange={val => setForm(p => ({ ...p, type: val }))}
                    options={[
                      { value: "Club", label: "Club" },
                      { value: "Society", label: "Society" },
                      { value: "Neighborhood", label: "Neighborhood" },
                    ]}
                    width="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-2">Games Played</label>
                  <div className="flex flex-wrap gap-2">
                    {GAME_OPTIONS.map(game => (
                      <button
                        key={game} type="button" onClick={() => toggleFormGame(game)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          form.games.includes(game)
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[#666]"
                        }`}
                      >
                        {game}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit" disabled={isCreating}
                  className="w-full bg-[var(--accent)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 mt-2"
                >
                  {isCreating ? "Creating..." : "Create Community"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
