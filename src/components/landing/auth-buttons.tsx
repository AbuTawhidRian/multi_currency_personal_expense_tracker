"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/dashboard" />}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/25 transition-all duration-200"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </div>
    );
  }

  return (
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
    </div>
  );
}

export function HeroCTA() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <div className="h-13 w-48 animate-pulse rounded-lg bg-white/10" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button
          size="lg"
          className="h-13 px-8 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-200 hover:scale-105"
          render={<Link href="/dashboard" />}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
  );
}

export function BottomCTA() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <div className="h-12 w-48 animate-pulse rounded-lg bg-white/20" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          size="lg"
          className="bg-white text-indigo-700 hover:bg-white/90 border-0 font-bold px-8 h-12 text-base shadow-xl transition-all duration-200 hover:scale-105"
          render={<Link href="/dashboard" />}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
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
  );
}
