"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [phone, setPhone] = useState("");
  const router = useRouter();
  
  const handleGoogleSignIn = async () => {
    try {
      // In a real app, this will work when env variables are set.
      await signInWithPopup(auth, googleProvider);
      router.push("/onboarding");
    } catch (error) {
      console.error(error);
      alert("Please configure Firebase keys in .env.local to test real auth. For demo purposes, we will route to onboarding anyway.");
      router.push("/onboarding");
    }
  };

  const handlePhoneOTP = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Phone auth requires Firebase reCAPTCHA setup. For now, click Google Sign-in to see the next flow.");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute top-6 left-6">
         <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-2">
            ← Back
         </Link>
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#8391ff] flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(94,106,210,0.5)] mb-6">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Log in to PlaySync</h1>
          <p className="text-[var(--muted)] mt-2">Welcome back! Ready for a match?</p>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors mb-6"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-[var(--border)]"></div>
          <span className="flex-shrink-0 mx-4 text-[var(--muted)] text-sm">or with phone</span>
          <div className="flex-grow border-t border-[var(--border)]"></div>
        </div>

        <form onSubmit={handlePhoneOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[var(--muted)] mb-1">Phone Number</label>
            <input 
              type="tel" 
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] placeholder:text-[#333] focus:outline-none focus:border-[var(--accent)] transition-colors"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-[var(--accent)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            Send OTP
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          Don&apos;t have an account? <Link href="/signup" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
