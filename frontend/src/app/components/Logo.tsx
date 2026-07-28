"use client";

import Image from "next/image";

interface LogoProps {
  /** Size in px for the logo image. Default: 38 */
  size?: number;
  /** Whether to show the "PlaySync" wordmark next to the icon */
  showText?: boolean;
  /** Extra CSS classes on the wrapper */
  className?: string;
}

export default function Logo({ size = 38, showText = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Animated logo mark */}
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Soft background glow to blend smoothly with dark theme */}
        <div
          className="absolute inset-0 rounded-full opacity-40 blur-md pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(94,106,210,0.5) 0%, transparent 70%)",
          }}
        />
        
        {/* Actual logo image with blur/glow pulse animation */}
        <div className="relative z-10 logo-glow-wrapper w-full h-full flex items-center justify-center">
          <Image
            src="/logo-transparent.png"
            alt="PlaySync logo"
            width={size}
            height={size}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {showText && (
        <span className="font-semibold tracking-tight text-[var(--foreground)]" style={{ fontSize: size * 0.52 }}>
          PlaySync
        </span>
      )}

      <style jsx>{`
        @keyframes logoBlurGlow {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(94,106,210,0.6)) blur(0px);
            transform: scale(0.96);
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(94,106,210,0.9)) blur(0.3px);
            transform: scale(1.04);
          }
        }

        .logo-glow-wrapper {
          animation: logoBlurGlow 3.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
