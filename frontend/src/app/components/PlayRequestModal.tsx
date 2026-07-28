"use client";

import { useState, useEffect, useRef } from "react";

const GAMES = ["Badminton", "Tennis", "Chess", "Table Tennis", "Cricket", "Football", "Basketball", "Carrom", "Volleyball", "Archery/Shooting"];

interface PlayRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { game: string; scheduledTime: string; message: string }) => void;
  playerName: string;
  playerGames?: string[];
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function PlayRequestModal({ isOpen, onClose, onSubmit, playerName, playerGames }: PlayRequestModalProps) {
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const d = String(tomorrow.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [game, setGame] = useState(playerGames?.[0] || "");
  const [date, setDate] = useState(getTomorrowStr());
  const [time, setTime] = useState("18:00");
  const [message, setMessage] = useState(`Hi ${playerName}! Would you like to play a game?`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const availableGames = playerGames && playerGames.length > 0 ? playerGames : GAMES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !date || !time) return;
    setIsSubmitting(true);
    const scheduledTime = new Date(`${date}T${time}`).toISOString();
    await onSubmit({ game, scheduledTime, message });
    setIsSubmitting(false);
    onClose();
  };

  // Calendar helpers
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let d = 1; d <= numDays; d++) daysArray.push(new Date(year, month, d));

  const isDateDisabled = (d: Date) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return d < todayStart;
  };

  const isDateSelected = (d: Date) => {
    if (!date) return false;
    const [y, m, dd] = date.split("-").map(Number);
    return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === dd;
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  };

  const selectDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setDate(`${y}-${m}-${dd}`);
    setShowCalendar(false);
  };

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return "Select Date";
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — no overflow-hidden so calendar never clips */}
      <div className="relative w-full max-w-md bg-[#161618] border border-[var(--border)] rounded-2xl shadow-2xl animate-slide-up my-auto">
        {/* Header glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Send Play Request</h2>
            <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="mb-5 p-3 rounded-xl bg-white/5 border border-[var(--border)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#222] border border-[#333] flex items-center justify-center font-bold">
              {playerName.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-sm">{playerName}</div>
              <div className="text-xs text-[var(--muted)]">
                {availableGames.slice(0, 3).join(", ")}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Game Selection */}
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-2">Game</label>
              <div className="grid grid-cols-2 gap-2">
                {availableGames.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGame(g)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      game === g
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[#666] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time — 2 col row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Date picker trigger */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">Date</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`w-full bg-[var(--background)] border rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm flex items-center justify-between focus:outline-none transition-colors text-left ${
                    showCalendar ? "border-[var(--accent)]" : "border-[var(--border)]"
                  }`}
                >
                  <span className="truncate text-xs">{formatDateLabel(date)}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 ml-1 transition-colors ${showCalendar ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </button>
              </div>

              {/* Time picker */}
              <div>
                <label className="block text-sm font-medium text-[var(--muted)] mb-2">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            {/* Inline full-width calendar — renders as a block in the form flow, no clipping */}
            {showCalendar && (
              <div ref={calendarRef} className="rounded-xl border border-[var(--accent)]/30 bg-[#19191b] p-4 shadow-xl">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{MONTHS[month]} {year}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-[var(--muted)] hover:text-white transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-[var(--muted)] hover:text-white transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-2">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold text-[var(--muted)] uppercase py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {daysArray.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;
                    const disabled = isDateDisabled(day);
                    const selected = isDateSelected(day);
                    const today = isToday(day);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={disabled}
                        onClick={() => selectDate(day)}
                        className={`h-8 w-full text-xs flex items-center justify-center rounded-lg font-medium transition-all ${
                          selected
                            ? "bg-[var(--accent)] text-white shadow-[0_0_10px_rgba(94,106,210,0.5)]"
                            : disabled
                            ? "text-white/15 cursor-not-allowed"
                            : today
                            ? "border border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent)]/10"
                            : "hover:bg-white/5 text-[var(--foreground)]"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[var(--muted)] mb-2">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-[var(--foreground)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!game || !date || isSubmitting}
              className="w-full bg-[var(--accent)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(94,106,210,0.3)]"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
