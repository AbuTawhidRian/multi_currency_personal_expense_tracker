import Link from 'next/link';
import { Globe2, Globe } from 'lucide-react';

/* Feature bullets shown on the left panel */
const PERKS = [
  { emoji: '🌍', text: 'Track expenses across 90+ currencies' },
  { emoji: '📊', text: 'Smart insights with live exchange rates' },
  { emoji: '🔒', text: 'Bank-level security for your data' },
  { emoji: '⚡', text: 'Set up in under 2 minutes' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080b14] flex overflow-hidden">

      {/* ── Left decorative panel (hidden on mobile) ──────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
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

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
              <Globe2 size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ExpatFi</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Your money,{' '}
              <span className="landing-gradient-text">everywhere it goes</span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed max-w-sm">
              The expense tracker built for expats, remote workers, and global citizens.
            </p>
          </div>

          <ul className="space-y-4">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-lg shrink-0">
                  {p.emoji}
                </span>
                <span className="text-sm text-white/65">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial quote */}
        <div className="relative z-10 glass-card rounded-2xl p-5">
          <p className="text-sm text-white/65 italic leading-relaxed mb-3">
            &ldquo;ExpatFi is the only app that truly understands the expat financial lifestyle.
            I earn in AED and send money home in BDT — it handles everything flawlessly.&rdquo;
          </p>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              S
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Sarah M.</div>
              <div className="text-xs text-white/40">Software Engineer · Dubai</div>
            </div>
          </div>
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
