"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GAMES = ["Badminton", "Tennis", "Chess", "Table Tennis", "Cricket", "Football", "Basketball", "Carrom"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

import { auth } from "@/lib/firebase";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter(g => g !== game));
    } else {
      if (selectedGames.length < 3) {
        setSelectedGames([...selectedGames, game]);
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      let token = "dummy_token";
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const res = await fetch("http://127.0.0.1:5001/api/users/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          games: selectedGames,
          skillLevel,
          location,
          name: auth.currentUser?.displayName || "Player"
        })
      });

      if (!res.ok) {
        // If auth fails (because we are using mock tokens), we still redirect for demo purposes
        console.warn("Backend sync failed, likely due to mock Firebase config. Proceeding to Discover.");
      }
      
      router.push("/discover");
    } catch (error) {
      console.error("Error syncing profile:", error);
      router.push("/discover");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
          <div className="text-sm text-[var(--muted)]">Step {step} of 3</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-2">What do you play?</h2>
              <p className="text-[var(--muted)] text-sm mb-6">Select up to 3 games you&apos;re interested in playing.</p>
              
              <div className="grid grid-cols-2 gap-3">
                {GAMES.map(game => (
                  <button
                    key={game}
                    onClick={() => toggleGame(game)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedGames.includes(game) 
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" 
                        : "border-[var(--border)] hover:border-[#666] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setStep(2)}
              disabled={selectedGames.length === 0}
              className="w-full bg-[var(--foreground)] text-[var(--background)] disabled:opacity-50 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-2">What&apos;s your skill level?</h2>
              <p className="text-[var(--muted)] text-sm mb-6">Help us match you with players of similar ability.</p>
              
              <div className="flex flex-col gap-3">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setSkillLevel(level)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      skillLevel === level 
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" 
                        : "border-[var(--border)] hover:border-[#666] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <div className="font-medium">{level}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {level === "Beginner" && "Just starting out or playing casually."}
                      {level === "Intermediate" && "Know the rules and play reasonably well."}
                      {level === "Advanced" && "Play competitively or have a high rating."}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 bg-[var(--foreground)] text-[var(--background)] font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-2">Where are you located?</h2>
              <p className="text-[var(--muted)] text-sm mb-6">We&apos;ll use this to find partners and venues near you.</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[var(--muted)] mb-2">City or Neighborhood</label>
                  <input 
                    type="text" 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Gomti Nagar, Lucknow"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[#333] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>
                
                <button className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--border)] rounded-xl text-[var(--accent)] font-medium hover:bg-white/5 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Use my current location
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={!location}
                className="flex-1 bg-[var(--accent)] text-white disabled:opacity-50 font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
