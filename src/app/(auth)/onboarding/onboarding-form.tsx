"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Globe, Home, Coins, Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/searchable-select';

interface Option {
  value: string;
  label: string;
}

interface Props {
  countryOptions: Option[];
  currencyOptions: Option[];
}

import { useSession } from 'next-auth/react';

export function OnboardingForm({ countryOptions, currencyOptions }: Props) {
  const router = useRouter();
  const { update } = useSession();
  
  const [currentCountry, setCurrentCountry] = React.useState('');
  const [homeCountry, setHomeCountry] = React.useState('');
  const [currency, setCurrency] = React.useState('');
  
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCountry || !homeCountry || !currency) {
      setError('Please select all options to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentCountryId: currentCountry,
          homeCountryId: homeCountry,
          reportingCurrencyId: currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      // Update session to reflect onboarding status
      await update({ isOnboarded: true });

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Current Country */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Globe size={14} className="text-violet-400" />
          Current Country
        </Label>
        <SearchableSelect
          options={countryOptions}
          value={currentCountry}
          onChange={setCurrentCountry}
          placeholder="Select current country"
        />
        <p className="text-xs text-white/30 pt-1">Where you currently live and work.</p>
      </div>
      
      {/* Home Country */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Home size={14} className="text-sky-400" />
          Home Country
        </Label>
        <SearchableSelect
          options={countryOptions}
          value={homeCountry}
          onChange={setHomeCountry}
          placeholder="Select home country"
        />
        <p className="text-xs text-white/30 pt-1">Where you send money or plan to return.</p>
      </div>

      {/* Reporting Currency */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Coins size={14} className="text-emerald-400" />
          Main Reporting Currency
        </Label>
        <SearchableSelect
          options={currencyOptions}
          value={currency}
          onChange={setCurrency}
          placeholder="Select reporting currency"
        />
        <p className="text-xs text-white/30 pt-1">The base currency for your dashboard charts.</p>
      </div>

      {error && (
        <div className="text-red-400 text-sm mt-2 p-2 bg-red-400/10 rounded-md border border-red-400/20">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
