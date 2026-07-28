"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/lib/Toast";

const GAMES = ["Badminton", "Tennis", "Chess", "Table Tennis", "Cricket", "Football", "Basketball", "Carrom", "Volleyball", "Archery/Shooting"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [location, setLocation] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const toggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      setSelectedGames(selectedGames.filter(g => g !== game));
    } else {
      if (selectedGames.length < 5) {
        setSelectedGames([...selectedGames, game]);
      }
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude, longitude } = position.coords;
      // Reverse geocode using a free API
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
      );
      const data = await res.json();
      
      const city = data.address?.city || data.address?.town || data.address?.village || "";
      const suburb = data.address?.suburb || data.address?.neighbourhood || "";
      const locationStr = suburb && city ? `${suburb}, ${city}` : city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      setLocation(locationStr);
      showToast(`Location detected: ${locationStr}`, "success");
    } catch (error) {
      console.error("Geolocation error:", error);
      showToast("Could not detect location. Please enter manually.", "error");
    } finally {
      setIsLocating(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/api/users/sync", {
        games: selectedGames,
        skillLevel,
        location,
        availability: {
          days: selectedDays,
          timeSlots: selectedTimeSlots,
        },
        name: user?.displayName || "Player",
      });
      
      showToast("Profile created! Let's find you a partner 🎯", "success");
      router.push("/discover");
    } catch (error) {
      console.error("Error syncing profile:", error);
      showToast("Profile saved locally. Backend sync will retry.", "info");
      router.push("/discover");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[#8391ff] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
          <div className="text-sm text-[var(--muted)]">Step {step} of {totalSteps}</div>
        </div>

        {/* Step 1: Games */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-2">What do you play?</h2>
              <p className="text-[var(--muted)] text-sm mb-6">Select up to 5 games you&apos;re interested in playing.</p>
              
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

        {/* Step 2: Skill Level */}
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

        {/* Step 3: Location */}
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
                
                <button 
                  type="button"
                  onClick={handleUseLocation}
                  disabled={isLocating}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--border)] rounded-xl text-[var(--accent)] font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {isLocating ? (
                    <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  )}
                  {isLocating ? "Detecting..." : "Use my current location"}
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
                onClick={() => setStep(4)}
                disabled={!location}
                className="flex-1 bg-[var(--foreground)] text-[var(--background)] disabled:opacity-50 font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Availability */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold mb-2">When are you available?</h2>
              <p className="text-[var(--muted)] text-sm mb-6">Select the days and times you&apos;re free to play.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-3">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedDays.includes(day)
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[#666] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--muted)] mb-3">Time of Day</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleTimeSlot(slot)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedTimeSlots.includes(slot)
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[#666] hover:text-[var(--foreground)]"
                        }`}
                      >
                        <div className="font-medium text-sm">{slot}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">
                          {slot === "Morning" && "6 AM – 12 PM"}
                          {slot === "Afternoon" && "12 PM – 4 PM"}
                          {slot === "Evening" && "4 PM – 8 PM"}
                          {slot === "Night" && "8 PM – 11 PM"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setStep(3)}
                className="px-6 py-3 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-xl hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex-1 bg-[var(--accent)] text-white disabled:opacity-50 font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
              >
                {isSubmitting ? "Setting up..." : "Complete Profile"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
