"use client";

import Link from "next/link";
import NavAuth from "@/app/components/NavAuth";
import Logo from "@/app/components/Logo";
import { useAuth } from "@/lib/AuthContext";

const FEATURES = [
  {
    title: "Smart Discovery",
    desc: "Find nearby players filtered by game type, skill level, and availability. No more cold broadcasts.",
    image: "/images/features/discovery.png",
  },
  {
    title: "Play Requests",
    desc: "Send and receive play requests with a specific game, time, and venue. Accept or decline instantly.",
    image: "/images/features/requests.png",
  },
  {
    title: "Communities",
    desc: "Join society clubs and neighbourhood groups. Post open play requests visible to all members.",
    image: "/images/features/communities.png",
  },
  {
    title: "Match History",
    desc: "Track all your past and upcoming matches. Never lose track of who you played with or where.",
    image: "/images/features/history.png",
  },
  {
    title: "Instant Matching",
    desc: "Search results in under 3 seconds. Filter by game, skill, city, day, and time of day.",
    image: "/images/features/matching.png",
  },
  {
    title: "Venue Discovery",
    desc: "Browse real nearby sports venues powered by Google Places — with ratings and supported games.",
    image: "/images/features/venue.png",
  },
];

const GAMES = [
  { name: "Badminton", image: "/images/badminton.png" },
  { name: "Chess", image: "/images/chess.png" },
  { name: "Table Tennis", image: "/images/table_tennis.png" },
  { name: "Tennis", image: "/images/tennis.png" },
  { name: "Carrom", image: "/images/carrom.png" },
  { name: "Cricket", image: "/images/cricket.png" },
  { name: "Football", image: "/images/football.png" },
  { name: "Basketball", image: "/images/basketball.png" },
  { name: "Volleyball", image: "/images/volleyball.png" },
  { name: "Archery/Shooting", image: "/images/archery.png" },
];

const CITIES = [
  { name: "Lucknow", venues: "20+", players: "Growing", image: "/images/cities/lucknow.png" },
  { name: "Jaipur", venues: "15+", players: "Growing", image: "/images/cities/jaipur.png" },
  { name: "Chandigarh", venues: "12+", players: "Growing", image: "/images/cities/chandigarh.png" },
  { name: "Ahmedabad", venues: "18+", players: "Growing", image: "/images/cities/ahmedabad.png" },
  { name: "Kolkata", venues: "25+", players: "Growing", image: "/images/cities/kolkata.png" },
  { name: "Hyderabad", venues: "22+", players: "Growing", image: "/images/cities/hyderabad.png" },
  { name: "Chennai", venues: "20+", players: "Growing", image: "/images/cities/chennai.png" },
  { name: "Pune", venues: "16+", players: "Growing", image: "/images/cities/pune.png" },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white">

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo size={38} showText={true} />
          </Link>
          <div className="flex items-center gap-4 md:gap-6 text-sm font-medium">
            <a href="#features" className="hidden md:block text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Features</a>
            <a href="#games" className="hidden md:block text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Games</a>
            <a href="#cities" className="hidden md:block text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Cities</a>
            {/* Auth-aware nav buttons */}
            <NavAuth />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="flex flex-col items-center justify-center px-6 pt-36 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[var(--border)] text-sm text-[var(--muted)] mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            Now live in 8 major Indian cities
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Find your next game partner <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[#9baced]">instantly.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            Connect with nearby players for chess, badminton, table tennis, carrom and more.
            Skip the WhatsApp groups and jump straight into the game.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            {user ? (
              /* Logged in — take them directly to the app */
              <Link href="/discover" className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-[#8391ff] rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-8 py-4 rounded-full font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  Go to Discover
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </Link>
            ) : (
              /* Not logged in — prompt sign up */
              <Link href="/signup" className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-[#8391ff] rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-8 py-4 rounded-full font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                  Start playing now
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </Link>
            )}
            <a href="#features" className="px-8 py-4 rounded-full font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-transparent hover:border-[var(--border)] transition-all">
              See how it works
            </a>
          </div>

          {/* Dashboard Preview */}
          <div className="w-full max-w-5xl mt-20 border border-[var(--border)] bg-[#131315]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-slide-up" style={{ animationDelay: "0.5s" }}>
            {/* Header bar */}
            <div className="h-10 border-b border-[var(--border)] bg-[#131315]/80 px-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              <div className="mx-auto text-[11px] text-[var(--muted)] bg-white/5 px-6 py-1 rounded-md">playsync.app/discover</div>
            </div>
            <div className="flex h-[340px] text-left">
              {/* Sidebar preview */}
              <div className="w-48 border-r border-[var(--border)] p-3 hidden sm:block shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-transparent.png" alt="logo" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-semibold">PlaySync</span>
                {["Discover", "My Matches", "Messages", "Communities"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 text-[10px] ${i === 0 ? "bg-white/5 text-white" : "text-[var(--muted)]"}`}>
                    <div className="w-3 h-3 rounded-sm bg-white/10"></div>
                    {item}
                  </div>
                ))}
              </div>
              {/* Content preview */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="text-[10px] text-[var(--muted)] mb-3">Find Players · Nearby Venues</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Rahul S.", skill: "Advanced", game: "Badminton", city: "Lucknow" },
                    { name: "Priya M.", skill: "Intermediate", game: "Chess", city: "Lucknow" },
                    { name: "Neha K.", skill: "Beginner", game: "Table Tennis", city: "Jaipur" },
                    { name: "Vikram R.", skill: "Advanced", game: "Tennis", city: "Jaipur" },
                  ].map(p => (
                    <div key={p.name} className="p-2.5 rounded-lg border border-[var(--border)] bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">{p.name[0]}</div>
                        <div>
                          <div className="text-[10px] font-medium leading-none">{p.name}</div>
                          <div className="text-[8px] text-[var(--muted)] mt-0.5">{p.city}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[8px]">
                        <span className="text-[var(--muted)]">{p.game}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 font-medium">{p.skill}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-24 border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 animate-fade-in">Designed for active recreation</h2>
              <p className="text-[var(--muted)]">Features built specifically for finding play partners, booking venues, and joining local clubs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map((feat) => (
                <div key={feat.title} className="group relative h-60 rounded-2xl border border-[var(--border)] overflow-hidden bg-[#131315] hover:border-[var(--accent)]/50 transition-all flex flex-col justify-end p-6 cursor-default">
                  {/* Background Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={feat.image} 
                    alt={feat.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500" 
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/30 to-transparent opacity-95 z-10" />
                  
                  {/* Content */}
                  <div className="relative z-20 text-left">
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent)] transition-colors mb-1.5">{feat.title}</h3>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Games Supported */}
        <section id="games" className="px-6 py-24 border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">10 games. One platform.</h2>
            <p className="text-[var(--muted)] mb-14">Whether it&apos;s an intense chess match or a casual badminton rally, PlaySync has you covered.</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {GAMES.map(game => (
                <div key={game.name} className="group relative h-40 rounded-xl border border-[var(--border)] overflow-hidden bg-[#131315] hover:border-[var(--accent)]/50 transition-all flex flex-col justify-end p-4 cursor-default">
                  {/* Background Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={game.image} 
                    alt={game.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500" 
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/20 to-transparent opacity-90 z-10" />
                  
                  {/* Text */}
                  <span className="relative z-20 text-sm font-semibold tracking-wide text-white group-hover:text-[var(--accent)] transition-colors text-left">{game.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities */}
        <section id="cities" className="px-6 py-24 border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Available in your city</h2>
            <p className="text-[var(--muted)] mb-14">We&apos;re live in select Indian cities and expanding fast. Join to unlock your city.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CITIES.map(city => (
                <div key={city.name} className="group relative h-44 rounded-2xl border border-[var(--border)] overflow-hidden bg-[#131315] hover:border-[var(--accent)]/50 transition-all flex flex-col justify-end p-4 cursor-default">
                  {/* Background Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" 
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f]/30 to-transparent opacity-95 z-10" />
                  
                  {/* Text Details */}
                  <div className="relative z-20 text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-[var(--accent)] transition-colors mb-0.5">{city.name}</h3>
                    <div className="space-y-0.5 text-[10px] text-[var(--muted)]">
                      <div>{city.venues} verified venues</div>
                      <div>{city.players} active players</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24 border-t border-[var(--border)]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to play?
            </h2>
            <p className="text-[var(--muted)] mb-10">Join hundreds of players already using PlaySync to find their next match.</p>
            <Link href="/signup" className="relative group inline-block">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-[#8391ff] rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-10 py-4 rounded-full font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
                Create your free account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size={28} showText={true} />
            <p className="text-xs text-[var(--muted)]">Built as part of the Unified Mentor project. Community-first recreational platform.</p>
            <div className="flex items-center gap-6 text-xs text-[var(--muted)]">
              <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-[var(--foreground)] transition-colors">Sign up</Link>
              <Link href="/admin" className="hover:text-[var(--foreground)] transition-colors">Admin</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
