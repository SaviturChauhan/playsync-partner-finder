"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import MobileNav from "@/app/components/MobileNav";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/lib/Toast";
import { useRouter } from "next/navigation";

const GAMES = ["Badminton", "Tennis", "Chess", "Table Tennis", "Cricket", "Football", "Basketball", "Carrom", "Volleyball", "Archery/Shooting"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

const AVATAR_OPTIONS = [
  { name: "Blue Racket", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&h=150&fit=crop&q=80" },
  { name: "Dark Chess", url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=150&h=150&fit=crop&q=80" },
  { name: "Neon Paddle", url: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=150&h=150&fit=crop&q=80" },
  { name: "Classic Soccer", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&h=150&fit=crop&q=80" },
  { name: "Basketball Glow", url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&h=150&fit=crop&q=80" },
  { name: "Premium Carrom", url: "/images/carrom.png" },
];

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    name: "",
    bio: "",
    location: "",
    games: [] as string[],
    skillLevel: "Intermediate",
    availability: { days: [] as string[], timeSlots: [] as string[] },
    avatar: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setIsFetching(true);
      try {
        const data = await api.get("/api/users/me");
        setProfile(data);
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          location: data.location || "",
          games: data.games || [],
          skillLevel: data.skillLevel || "Intermediate",
          availability: data.availability || { days: [], timeSlots: [] },
          avatar: data.avatar || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  const toggleGame = (game: string) => {
    setForm(prev => ({
      ...prev,
      games: prev.games.includes(game)
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game],
    }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day],
      },
    }));
  };

  const toggleTimeSlot = (slot: string) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: prev.availability.timeSlots.includes(slot)
          ? prev.availability.timeSlots.filter(s => s !== slot)
          : [...prev.availability.timeSlots, slot],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await api.put("/api/users/me", form);
      setProfile(updated);
      setIsEditing(false);
      window.dispatchEvent(new Event("profile-updated"));
      showToast("Profile updated!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 bg-[var(--background)] z-10">
          <h1 className="font-medium">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm border border-[var(--border)] bg-white/5 hover:bg-white/10 text-[var(--foreground)] px-4 py-1.5 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setIsEditing(false); }}
                className="text-sm border border-[var(--border)] text-[var(--muted)] px-4 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-sm bg-[var(--accent)] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20 md:pb-10">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

            {/* Avatar + Basic Info */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-white/[0.02]">
              <div className="flex items-center gap-5 mb-6">
                <div className="relative group w-16 h-16 shrink-0">
                  {form.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={form.avatar} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover border border-[var(--border)] shadow-[0_0_20px_rgba(94,106,210,0.4)]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center text-white text-2xl font-bold shadow-[0_0_20px_rgba(94,106,210,0.4)]">
                      {(form.name || user?.displayName || "U").charAt(0)}
                    </div>
                  )}
                  {isEditing && (
                    <button 
                      onClick={() => setShowAvatarPicker(prev => !prev)}
                      type="button"
                      className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-[10px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-[var(--accent)]/50"
                    >
                      Change
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text" value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-lg font-semibold w-full focus:outline-none focus:border-[var(--accent)]"
                    />
                  ) : (
                    <h2 className="text-xl font-semibold">{profile?.name || user?.displayName || "Player"}</h2>
                  )}
                  <p className="text-[var(--muted)] text-sm mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Avatar Quick Picker */}
              {isEditing && showAvatarPicker && (
                <div className="mb-6 p-4 border border-[var(--border)] bg-[#131315]/50 rounded-xl animate-slide-up">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-semibold text-white">Select a Sports Avatar</h4>
                    <button 
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="text-[10px] text-[var(--muted)] hover:text-white"
                    >
                      Close
                    </button>
                  </div>
                  
                  {/* Preset Avatars */}
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, avatar: opt.url }))}
                        className={`relative h-10 rounded-lg overflow-hidden border transition-all ${
                          form.avatar === opt.url ? "border-[var(--accent)] scale-95" : "border-[var(--border)] hover:border-white/20"
                        }`}
                        title={opt.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={opt.url} alt={opt.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  {/* Custom URL Input */}
                  <div>
                    <label className="block text-[10px] text-[var(--muted)] mb-1">Or enter a custom image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={form.avatar}
                        onChange={(e) => setForm(p => ({ ...p, avatar: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                      />
                      {form.avatar && (
                        <button
                          type="button"
                          onClick={() => setForm(p => ({ ...p, avatar: "" }))}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={form.bio} rows={3}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others a bit about yourself..."
                    maxLength={300}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    {profile?.bio || "No bio yet. Click Edit Profile to add one."}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-white/[0.02]">
              <h3 className="font-medium mb-4">Location</h3>
              {isEditing ? (
                <input
                  type="text" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Gomti Nagar, Lucknow"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {profile?.location || "Not set"}
                </div>
              )}
            </div>

            {/* Skill Level */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-white/[0.02]">
              <h3 className="font-medium mb-4">Skill Level</h3>
              {isEditing ? (
                <div className="flex gap-3">
                  {SKILL_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setForm(p => ({ ...p, skillLevel: level }))}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                        form.skillLevel === level
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[#666]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-sm font-medium">
                  {profile?.skillLevel || "Intermediate"}
                </span>
              )}
            </div>

            {/* Games */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-white/[0.02]">
              <h3 className="font-medium mb-4">Games I Play</h3>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  {GAMES.map(game => (
                    <button
                      key={game} onClick={() => toggleGame(game)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${
                        form.games.includes(game)
                          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[#666]"
                      }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profile?.games || []).length > 0 ? (
                    profile.games.map((g: string) => (
                      <span key={g} className="text-sm px-3 py-1.5 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent)]/10">
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--muted)] text-sm">No games selected</span>
                  )}
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="p-6 rounded-xl border border-[var(--border)] bg-white/[0.02]">
              <h3 className="font-medium mb-4">Availability</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-2 block">Days</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day} onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            form.availability.days.includes(day)
                              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "border-[var(--border)] text-[var(--muted)] hover:border-[#666]"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)] mb-2 block">Time Slots</label>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map(slot => (
                        <button
                          key={slot} onClick={() => toggleTimeSlot(slot)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            form.availability.timeSlots.includes(slot)
                              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "border-[var(--border)] text-[var(--muted)] hover:border-[#666]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {profile?.availability?.days?.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {profile.availability.days.map((d: string) => (
                          <span key={d} className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] bg-white/5">{d}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.availability.timeSlots?.map((s: string) => (
                          <span key={s} className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] bg-white/5">{s}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-[var(--muted)] text-sm">Not set</span>
                  )}
                </div>
              )}
            </div>

            {/* Sign Out */}
            <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Sign out</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">You can always log back in</p>
                </div>
                <button
                  onClick={() => { logout(); router.push("/"); }}
                  className="text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
