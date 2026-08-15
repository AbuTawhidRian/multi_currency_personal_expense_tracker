import Link from 'next/link';
import { Globe2 } from 'lucide-react';
import { AuthCarousel } from '@/components/auth-carousel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080b14] flex overflow-hidden">

      {/* ── Left decorative panel (hidden on mobile) ──────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col p-12 overflow-hidden">
        {/* Background orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px] bg-violet-600 animate-float-orb"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full opacity-15 blur-[100px] bg-indigo-500 animate-float-orb-reverse"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full opacity-10 blur-[80px] bg-sky-400"
        />

        {/* Faint grid lines */}
        <div
          aria-hidden
          className="absolute inset-0 hero-mesh pointer-events-none"
        />

        {/* Top Navigation */}
        <div className="relative z-20 mb-12">
          <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <Globe2 size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ExpatFi</span>
          </Link>
        </div>

        {/* Carousel Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <AuthCarousel />
        </div>
      </div>

      {/* ── Right form panel ───────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
        {/* Subtle radial glow behind form */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.25_264_/_0.07)_0%,transparent_65%)]"
        />

        {/* Mobile-only logo */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
            <Globe2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">ExpatFi</span>
        </Link>

        {/* Card */}
        <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-8 shadow-2xl shadow-black/40">
          {children}
        </div>

        <p className="relative z-10 mt-6 text-xs text-white/25 text-center">
          &copy; {new Date().getFullYear()} ExpatFi. Built for the modern expat.
        </p>
      </div>
    </div>
  );
}
