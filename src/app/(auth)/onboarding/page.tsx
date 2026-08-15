"use client"

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Globe, Home, Coins } from 'lucide-react';
import { COUNTRIES, CURRENCIES } from '@/lib/constants';
import { SearchableSelect } from '@/components/searchable-select';

export default function OnboardingPage() {
  const [currentCountry, setCurrentCountry] = React.useState('AE');
  const [homeCountry, setHomeCountry] = React.useState('BD');
  const [currency, setCurrency] = React.useState('AED');

  // Prepare options for the combobox
  const countryOptions = React.useMemo(() => 
    COUNTRIES.map(c => ({ value: c.code, label: `${c.flag} ${c.name}` })),
  []);
  
  const currencyOptions = React.useMemo(() => 
    CURRENCIES.map(c => ({ value: c.code, label: `${c.code} - ${c.name}` })),
  []);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
          Complete your profile
        </h1>
        <p className="text-sm text-white/45">
          Set up your expat finance preferences
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5">
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
            searchPlaceholder="Search country..."
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
            searchPlaceholder="Search country..."
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
            searchPlaceholder="Search currency..."
          />
          <p className="text-xs text-white/30 pt-1">The base currency for your dashboard charts.</p>
        </div>

        {/* Submit */}
        <Button
          type="button"
          className="w-full h-11 mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02]"
          render={<Link href="/dashboard" />}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
