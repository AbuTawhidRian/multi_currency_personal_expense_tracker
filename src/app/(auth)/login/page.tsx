"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Mail, Lock, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
          Welcome back
        </h1>
        <p className="text-sm text-white/45">
          Sign in to your ExpatFi account
        </p>
      </div>

      {/* Social login placeholder */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-sm font-medium py-2.5 transition-all duration-200 mb-5"
      >
        {/* Google icon */}
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.4 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.4 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-2.7-11.3-7H6.3C9.7 39.7 16.3 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C41.1 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z" />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/[0.08]" />
        <span className="text-xs text-white/30 font-medium">or with email</span>
        <div className="flex-1 h-px bg-white/[0.08]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-white/70">
            Email address
          </Label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="pl-9 bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl h-11 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-white/70">
              Password
            </Label>
            <Link
              href="#"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="pl-9 bg-white/[0.05] border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/60 focus:ring-violet-500/20 rounded-xl h-11 transition-all"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02]"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>

      {/* Trust note */}
      <p className="mt-4 text-center text-xs text-white/25 flex items-center justify-center gap-1.5">
        <ShieldCheck size={12} className="text-emerald-400/70" />
        Your data is encrypted and never shared
      </p>

      {/* Switch to register */}
      <div className="mt-6 text-center text-sm">
        <span className="text-white/40">Don&apos;t have an account? </span>
        <Link
          href="/register"
          className="text-violet-400 font-semibold hover:text-violet-300 transition-colors"
        >
          Sign up free
        </Link>
      </div>
    </div>
  );
}
