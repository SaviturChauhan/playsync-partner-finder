"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  /** Width class, e.g. "w-36". Defaults to auto. */
  width?: string;
}

export default function Select({ value, onChange, options, className = "", width = "" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${width} ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer select-none
          ${open
            ? "border-[var(--accent)] bg-white/10 text-[var(--foreground)]"
            : "border-[var(--border)] bg-white/5 text-[var(--foreground)] hover:border-[#555] hover:bg-white/10"
          }
          ${width ? "w-full" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 text-[var(--muted)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1.5 min-w-full rounded-xl border border-[var(--border)] bg-[#131315] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up"
          style={{ animationDuration: "120ms" }}
        >
          {/* Glow line on top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
          <div className="py-1">
            {options.map(option => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  role="option"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors text-left
                    ${isActive
                      ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                    }
                  `}
                >
                  <span>{option.label}</span>
                  {isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
