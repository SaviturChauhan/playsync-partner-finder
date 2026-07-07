"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Mock Data for Lucknow and Jaipur
const MOCK_VENUES = [
  { _id: "1", name: "BBD Badminton Academy", location: "Gomti Nagar, Lucknow", type: "Indoor", games: ["Badminton", "Table Tennis"], rating: 4.8 },
  { _id: "2", name: "KD Singh Babu Stadium", location: "Hazratganj, Lucknow", type: "Outdoor", games: ["Cricket", "Football", "Tennis"], rating: 4.5 },
  { _id: "3", name: "SMS Stadium Complex", location: "Lalkothi, Jaipur", type: "Mixed", games: ["Badminton", "Tennis", "Basketball"], rating: 4.7 },
  { _id: "4", name: "Clubhouse - Omaxe Heights", location: "Vibhuti Khand, Lucknow", type: "Indoor", games: ["Chess", "Carrom", "Table Tennis"], rating: 4.2 },
];

const MOCK_PLAYERS = [
  { id: 1, name: "Rahul S.", location: "Gomti Nagar, Lucknow", games: ["Badminton"], skill: "Advanced", active: "2h ago" },
  { id: 2, name: "Priya M.", location: "Hazratganj, Lucknow", games: ["Chess", "Carrom"], skill: "Intermediate", active: "Online now" },
  { id: 3, name: "Vikram R.", location: "Malviya Nagar, Jaipur", games: ["Tennis"], skill: "Advanced", active: "1d ago" },
  { id: 4, name: "Neha K.", location: "C-Scheme, Jaipur", games: ["Table Tennis", "Badminton"], skill: "Beginner", active: "Online now" },
];

export default function Discover() {
  const [activeTab, setActiveTab] = useState("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("Lucknow");
  const [venues, setVenues] = useState<Array<Record<string, any>>>(MOCK_VENUES);
  const [players, setPlayers] = useState<Array<Record<string, any>>>(MOCK_PLAYERS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      if (cityFilter === "All") return;
      setIsLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:5001/api/venues?city=${cityFilter}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setVenues(data);
          } else {
            // Fallback to mock if API returns empty (e.g. no Google API key)
            setVenues(MOCK_VENUES.filter(v => v.location.includes(cityFilter)));
          }
        }
      } catch (err) {
        console.error("Failed to fetch venues", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPlayers = async () => {
      try {
        let token = "dummy";
        try {
          const { auth } = await import("@/lib/firebase");
          if (auth.currentUser) token = await auth.currentUser.getIdToken();
        } catch(error) {}
        
        const res = await fetch(`http://127.0.0.1:5001/api/players?city=${cityFilter}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setPlayers(data);
        }
      } catch (err) {
        console.error("Failed to fetch players", err);
      }
    };

    fetchVenues();
    fetchPlayers();
  }, [cityFilter]);

  const handleSendRequest = async (receiverId: string) => {
    alert("Sending play request...");
    try {
      let token = "dummy";
      try {
        const { auth } = await import("@/lib/firebase");
        if (auth.currentUser) token = await auth.currentUser.getIdToken();
      } catch(e) {}

      const res = await fetch("http://127.0.0.1:5001/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId,
          game: "Any",
          scheduledTime: new Date(new Date().getTime() + 86400000).toISOString(),
          message: "Hi! Would you like to play a game?"
        })
      });
      if (res.ok) {
        alert("Request sent successfully!");
      } else {
        alert("Error sending request (ensure you are logged in).");
      }
    } catch(err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const filteredPlayers = players.filter(p => 
    (cityFilter === "All" || p.location?.includes(cityFilter)) &&
    (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.games?.some((g:string) => g.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredVenues = venues.filter(v => 
    (cityFilter === "All" || v.location.includes(cityFilter)) &&
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.games.some((g: string) => g.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar (Linear Style) */}
      <aside className="w-64 border-r border-[var(--border)] hidden md:flex flex-col bg-[var(--background)] p-4 animate-fade-in">
        <Link href="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center font-bold text-white text-xs">P</div>
          <span className="font-semibold tracking-tight text-[var(--foreground)]">PlaySync</span>
        </Link>
        
        <nav className="space-y-1">
          <Link href="/discover" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-[var(--foreground)] font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            Discover
          </Link>
          <Link href="/matches" className="flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors">
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
        {/* Header/Topbar */}
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[var(--background)] z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search players, games, or venues..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 pr-4 py-2 placeholder:text-[var(--muted)] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-transparent border border-[var(--border)] text-[var(--foreground)] rounded-md text-sm px-3 py-1.5 focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="All" className="bg-[#111]">All Cities</option>
              <option value="Lucknow" className="bg-[#111]">Lucknow</option>
              <option value="Jaipur" className="bg-[#111]">Jaipur</option>
            </select>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_10px_rgba(94,106,210,0.3)]">
              US
            </div>
          </div>
        </header>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 border-b border-[var(--border)] mb-8">
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

            <div className="animate-slide-up">
              {activeTab === "players" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                    <div key={player.id} className="p-5 rounded-xl border border-[var(--border)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#222] border border-[#333] flex items-center justify-center font-bold">{player.name.charAt(0)}</div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {player.name}
                              {player.active === "Online now" && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>}
                            </div>
                            <div className="text-xs text-[var(--muted)]">{player.location}</div>
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-white/5 border border-[var(--border)] text-[var(--muted)]">{player.skill}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(player.games || []).map((game: string) => (
                          <span key={game} className="text-xs px-2 py-1 rounded-full border border-[var(--border)] text-[var(--muted)] bg-white/5">{game}</span>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleSendRequest(player._id || player.id)}
                        className="w-full py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--accent-hover)] shadow-lg hover:shadow-[0_0_15px_rgba(94,106,210,0.4)]"
                      >
                        Send Play Request
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-[var(--muted)]">No players found matching your criteria.</div>
                  )}
                </div>
              )}

              {activeTab === "venues" && (
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
                      <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors border border-white/5">
                        View Details & Players Here
                      </button>
                    </div>
                  )) : (
                    <div className="col-span-full py-12 text-center text-[var(--muted)]">No venues found matching your criteria.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
