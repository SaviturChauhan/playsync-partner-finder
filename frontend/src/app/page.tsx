import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white">
      {/* Navigation (Glassmorphism) */}
      <nav className="fixed top-0 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(94,106,210,0.5)]">
              P
            </div>
            <span className="font-semibold text-lg tracking-tight">PlaySync</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="#features" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Features</Link>
            <Link href="#cities" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Cities</Link>
            <Link href="/login" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors">Log in</Link>
            <Link href="/signup" className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-full hover:bg-gray-200 transition-transform active:scale-95">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[var(--border)] text-sm text-[var(--muted)] mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
          Now live in Lucknow & Jaipur
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Find your next game partner <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[#9baced]">instantly.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          Connect with nearby players for chess, badminton, table tennis, and more. Skip the WhatsApp groups and jump straight into the game.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link href="/signup" className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)] to-[#8391ff] rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-8 py-4 rounded-full font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
              Start playing now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </Link>
          <Link href="#explore" className="px-8 py-4 rounded-full font-medium text-[var(--muted)] hover:text-[var(--foreground)] border border-transparent hover:border-[var(--border)] transition-all">
            Explore venues
          </Link>
        </div>
        
        {/* Mockup Preview Area */}
        <div className="mt-24 w-full max-w-5xl rounded-2xl border border-[var(--border)] bg-black/50 backdrop-blur-3xl overflow-hidden shadow-2xl relative animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
          <div className="h-12 border-b border-[var(--border)] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <div className="h-[400px] flex items-center justify-center text-[var(--muted)] bg-gradient-to-b from-white/[0.02] to-transparent">
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center text-2xl">🏸</div>
                <p>Interactive Map & Dashboard UI coming soon</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
