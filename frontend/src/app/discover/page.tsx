"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";
import PlayRequestModal from "@/app/components/PlayRequestModal";
import Select from "@/app/components/Select";
import { api } from "@/lib/api";
import { useToast } from "@/lib/Toast";
import { useAuth } from "@/lib/AuthContext";

const GAMES = ["All", "Badminton", "Tennis", "Chess", "Table Tennis", "Cricket", "Football", "Basketball", "Carrom", "Volleyball", "Archery/Shooting"];
const SKILLS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Discover() {
  const [activeTab, setActiveTab] = useState("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("Lucknow");
  const [gameFilter, setGameFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [venues, setVenues] = useState<Array<Record<string, any>>>([]);
  const [players, setPlayers] = useState<Array<Record<string, any>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user, loading } = useAuth();

  // Play request modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Build query string for players
        const playerParams = new URLSearchParams();
        if (cityFilter !== "All") playerParams.append("city", cityFilter);
        if (gameFilter !== "All") playerParams.append("game", gameFilter);
        if (skillFilter !== "All") playerParams.append("skill", skillFilter);

        const [venueData, playerData] = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001"}/api/venues?city=${cityFilter}`).then(r => r.json()),
          api.get(`/api/players?${playerParams.toString()}`),
        ]);

        if (venueData.status === "fulfilled") setVenues(venueData.value);
        if (playerData.status === "fulfilled") setPlayers(playerData.value);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      if (user) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    }
  }, [cityFilter, gameFilter, skillFilter, user, loading]);

  const handleSendRequest = async (data: { game: string; scheduledTime: string; message: string }) => {
    if (!selectedPlayer) return;
    try {
      await api.post("/api/requests", {
        receiverId: selectedPlayer._id,
        game: data.game,
        scheduledTime: data.scheduledTime,
        message: data.message,
      });
      showToast(`Play request sent to ${selectedPlayer.name}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to send request. Please log in first.", "error");
    }
  };

  const openRequestModal = (player: Record<string, any>) => {
    setSelectedPlayer(player);
    setModalOpen(true);
  };

  // Client-side search filter
  const filteredPlayers = players.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.games?.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredVenues = venues.filter(v =>
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.games?.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Loading skeleton
  const SkeletonCard = () => (
    <div className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-white/10" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-white/5 rounded-full w-16" />
        <div className="h-6 bg-white/5 rounded-full w-20" />
      </div>
      <div className="h-9 bg-white/5 rounded-lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header/Topbar */}
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 shrink-0 bg-[var(--background)] z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent)] drop-shadow-[0_0_8px_rgba(94,106,210,0.5)]" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search players, games, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 py-2 placeholder:text-[var(--muted)] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Select
              value={cityFilter}
              onChange={setCityFilter}
              options={[
                { value: "All", label: "All Cities" },
                { value: "Lucknow", label: "Lucknow" },
                { value: "Jaipur", label: "Jaipur" },
                { value: "Chandigarh", label: "Chandigarh" },
                { value: "Ahmedabad", label: "Ahmedabad" },
                { value: "Kolkata", label: "Kolkata" },
                { value: "Hyderabad", label: "Hyderabad" },
                { value: "Chennai", label: "Chennai" },
                { value: "Pune", label: "Pune" },
              ]}
              width="w-36"
            />
          </div>
        </header>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20 md:pb-10">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-[var(--border)] mb-6">
              <button
                onClick={() => setActiveTab("players")}
                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "players" ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Find Players
                {activeTab === "players" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full"></div>}
              </button>
              <button
                onClick={() => setActiveTab("venues")}
                className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "venues" ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              >
                Nearby Venues
                {activeTab === "venues" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--accent)] rounded-t-full"></div>}
              </button>
            </div>

            {/* Filters (only for players tab) */}
            {activeTab === "players" && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Select
                  value={gameFilter}
                  onChange={setGameFilter}
                  options={GAMES.map(g => ({ value: g, label: g === "All" ? "All Games" : g }))}
                  width="w-36"
                />
                <Select
                  value={skillFilter}
                  onChange={setSkillFilter}
                  options={SKILLS.map(s => ({ value: s, label: s === "All" ? "All Levels" : s }))}
                  width="w-32"
                />
              </div>
            )}

            <div className="animate-slide-up">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : activeTab === "players" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                    <div key={player._id || player.id} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-[#8391ff]/30 border border-[var(--accent)]/20 flex items-center justify-center font-bold text-sm">
                            {player.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {player.name}
                            </div>
                            <div className="text-xs text-[var(--muted)]">{player.location}</div>
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-white/5 border border-[var(--border)] text-[var(--muted)]">
                          {player.skillLevel || player.skill}
                        </div>
                      </div>

                      {/* Availability */}
                      {player.availability?.days?.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3 text-[10px] text-[var(--muted)]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {player.availability.days.slice(0, 3).map((d: string) => d.slice(0, 3)).join(", ")}
                          {player.availability.days.length > 3 && ` +${player.availability.days.length - 3}`}
                          {player.availability.timeSlots?.length > 0 && ` · ${player.availability.timeSlots.join(", ")}`}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(player.games || []).map((game: string) => (
                          <span key={game} className="text-xs px-2 py-1 rounded-full border border-[var(--border)] text-[var(--muted)] bg-white/5">{game}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => openRequestModal(player)}
                        className="w-full py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--accent-hover)] shadow-lg hover:shadow-[0_0_15px_rgba(94,106,210,0.4)]"
                      >
                        Send Play Request
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-16 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_20px_rgba(94,106,210,0.15)] bg-black/20">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </div>
                      <p className="text-[var(--muted)]">No players found matching your criteria.</p>
                      <p className="text-sm text-[var(--muted)] mt-1">Try changing filters or inviting friends to join!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVenues.length > 0 ? filteredVenues.map(venue => (
                    <div key={venue._id || venue.id} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg">{venue.name}</h3>
                        <div className="flex items-center gap-1 text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          {venue.rating}
                        </div>
                      </div>
                      <div className="text-sm text-[var(--muted)] mb-4 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {venue.location}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(venue.games || []).map((game: string) => (
                          <span key={game} className="text-xs px-2 py-1 rounded border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/10">{game}</span>
                        ))}
                      </div>
                      <div className="text-xs text-[var(--muted)] px-2 py-1 rounded bg-white/5 border border-[var(--border)] inline-block">
                        {venue.type}
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-16 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-2xl">🏟️</div>
                      <p className="text-[var(--muted)]">No venues found for this city.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Play Request Modal */}
      {selectedPlayer && (
        <PlayRequestModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedPlayer(null); }}
          onSubmit={handleSendRequest}
          playerName={selectedPlayer.name}
          playerGames={selectedPlayer.games}
        />
      )}
    </div>
  );
}
