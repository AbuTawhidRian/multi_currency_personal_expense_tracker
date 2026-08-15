import Link from 'next/link';
import {
  ArrowRight,
  Globe2,
  Wallet,
  PieChart,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Bell,
  CheckCircle2,
  Star,
  Zap,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Static data ─────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Globe2,
    title: 'Multi-Country Support',
    description:
      'Earn in AED, spend in BDT. Track exactly where your money goes across different borders with country-specific reporting.',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    icon: Wallet,
    title: 'Dual-Currency Display',
    description:
      'Every transaction locks in the exchange rate. See expenses in the original currency and your reporting currency instantly.',
    accent: 'from-sky-500 to-cyan-400',
  },
  {
    icon: PieChart,
    title: 'Smart Insights',
    description:
      'Beautiful charts show your savings rate, top spending categories, and cross-border transfers at a glance.',
    accent: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Exchange Rate History',
    description:
      'View historical rates, track currency trends, and understand how fluctuations affect your purchasing power over time.',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    icon: RefreshCw,
    title: 'Live Rate Sync',
    description:
      'Rates update automatically so your portfolio value is always accurate — no manual entry needed.',
    accent: 'from-amber-500 to-orange-400',
  },
  {
    icon: Bell,
    title: 'Budget Alerts',
    description:
      'Set spending limits per category or country. Get notified before you overspend — in whichever currency you prefer.',
    accent: 'from-rose-500 to-red-400',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Sign up in under 60 seconds. No credit card required.',
  },
  {
    step: '02',
    title: 'Set your currencies',
    description:
      'Tell us which countries you live and work in, and pick your main reporting currency.',
  },
  {
    step: '03',
    title: 'Start tracking',
    description:
      'Log income, expenses, and transfers. ExpatFi handles the conversion maths automatically.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Software Engineer · Dubai → UK',
    quote:
      'Finally an app that understands my life. I earn in AED, support family in Bangladesh, and save in USD. ExpatFi tracks it all without any headaches.',
    rating: 5,
  },
  {
    name: 'Ravi K.',
    role: 'Finance Analyst · Singapore',
    quote:
      'The dual-currency display is a game-changer. I can see exactly what I spent in SGD and what that means in INR with zero manual work.',
    rating: 5,
  },
  {
    name: 'Amira T.',
    role: 'Nurse · Qatar → Egypt',
    quote:
      'I used to keep 3 separate spreadsheets. Now I use ExpatFi and my entire financial picture is one dashboard. Absolutely worth it.',
    rating: 5,
  },
];

const STATS = [
  { value: '12,400+', label: 'Expats Tracking' },
  { value: '90+', label: 'Currencies Supported' },
  { value: '35+', label: 'Countries' },
  { value: '$2.1B+', label: 'Transactions Logged' },
];

/* ─── Component ────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080b14] text-white flex flex-col overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080b14]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 animate-pulse-ring">
              <Globe2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ExpatFi</span>
          </div>

          {/* Nav links (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Button
              render={<Link href="/register" />}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/25 transition-all duration-200"
            >
              Get Started
            </Button>
            {/* Mobile menu icon (non-functional, visual only) */}
            <button className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative w-full pt-24 pb-20 md:pt-36 md:pb-32 flex flex-col items-center text-center px-4 overflow-hidden">

          {/* Background orbs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full opacity-20 blur-[100px] bg-violet-600 animate-float-orb"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px] bg-indigo-500 animate-float-orb-reverse"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full opacity-10 blur-[80px] bg-sky-400"
          />

          {/* Mesh grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hero-mesh"
          />

          {/* Badge */}
          <div className="animate-fade-in-up relative z-10 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            Built for Global Citizens
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 relative z-10 text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-[1.08]">
            Track Your Money{' '}
            <br className="hidden md:block" />
            <span className="landing-gradient-text">Across Every Border</span>
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in-up delay-200 relative z-10 text-lg md:text-xl text-white/55 max-w-2xl mb-10 leading-relaxed">
            Manage income, expenses, transfers, and savings across multiple countries — all in one place.
            Live exchange rates. Zero spreadsheets.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in-up delay-300 relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              className="h-13 px-8 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-200 hover:scale-105"
              render={<Link href="/register" />}
            >
              Start Tracking Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-8 text-base border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 backdrop-blur-sm transition-all duration-200"
            >
              View Demo
            </Button>
          </div>

          {/* Trust note */}
          <p className="animate-fade-in-up delay-400 relative z-10 mt-6 text-xs text-white/35 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            No credit card required · Free forever for personal use
          </p>
        </section>

        {/* ── Stats ticker ───────────────────────────────────── */}
        <div className="border-y border-white/[0.07] bg-white/[0.02] py-6 overflow-hidden">
          <div className="flex gap-0 w-max animate-ticker">
            {[...STATS, ...STATS].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-12 px-16 border-r border-white/10 last:border-r-0"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-white/45 mt-0.5 whitespace-nowrap">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ───────────────────────────────────────── */}
        <section id="features" className="w-full py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Section header */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
                <Zap size={12} />
                Everything you need
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Built for the modern expat
              </h2>
              <p className="text-white/50 max-w-xl mx-auto text-lg">
                Every feature designed around the reality of living, earning, and spending across borders.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={`group relative glass-card rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 animate-fade-in-up delay-${(i + 1) * 100}`}
                  >
                    {/* Icon */}
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} mb-5 shadow-lg`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-base font-semibold mb-2 text-white">{f.title}</h3>
                    <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
                    {/* Hover glow */}
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${f.accent} blur-2xl -z-10`}
                      style={{ transform: 'scale(0.6)', opacity: 0 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section
          id="how-it-works"
          className="w-full py-24 px-4 border-t border-white/[0.06] bg-white/[0.02]"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 mb-4">
                <CheckCircle2 size={12} />
                Simple setup
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Up and running in minutes
              </h2>
              <p className="text-white/50 max-w-lg mx-auto text-lg">
                No complex configuration. No accountant required.
              </p>
            </div>

            <div className="relative grid md:grid-cols-3 gap-8">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-violet-500/30 via-sky-500/30 to-emerald-500/30" />

              {STEPS.map((s, i) => (
                <div key={s.step} className={`relative flex flex-col items-center text-center animate-fade-in-up delay-${(i + 1) * 200}`}>
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl shadow-violet-500/30 mb-5">
                    <span className="text-xl font-black text-white">{s.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-white">{s.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed max-w-xs">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ───────────────────────────────────── */}
        <section id="testimonials" className="w-full py-24 px-4 border-t border-white/[0.06]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-300 mb-4">
                <Star size={12} className="fill-current" />
                Loved by expats worldwide
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Real stories from real users
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`glass-card rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1 animate-fade-in-up delay-${(i + 1) * 200}`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-5 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{t.name}</div>
                      <div className="text-xs text-white/40">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA banner ──────────────────────────────── */}
        <section className="w-full py-20 px-4 border-t border-white/[0.06]">
          <div className="container mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-sky-700 p-10 md:p-16 text-center shadow-2xl shadow-violet-900/50">
              {/* BG orbs */}
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
                  Start tracking for free today
                </h2>
                <p className="text-white/65 text-lg mb-8 max-w-lg mx-auto">
                  Join thousands of expats who finally have a clear picture of their global finances.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-white/90 border-0 font-bold px-8 h-12 text-base shadow-xl transition-all duration-200 hover:scale-105"
                    render={<Link href="/register" />}
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm h-12 px-8 text-base transition-all duration-200"
                  >
                    Learn More
                  </Button>
                </div>
                <p className="mt-5 text-xs text-white/40 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={12} />
                  Free forever · No credit card · Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#050810] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Globe2 size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm text-white">ExpatFi</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                The multi-currency expense tracker built for people who call more than one country home.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#features" className="hover:text-white/70 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white/70 transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-white/70 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white/70 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} ExpatFi. Built for the modern expat.
            </p>
            <p className="text-xs text-white/20">All exchange rate data for informational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
