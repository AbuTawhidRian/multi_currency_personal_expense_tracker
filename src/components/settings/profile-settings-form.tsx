"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfile } from "@/actions/profile";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  reportingCurrencyId: z.string().min(1, "Reporting currency is required"),
  currentCountryId: z.string().min(1, "Current country is required"),
  homeCountryId: z.string().min(1, "Home country is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileSettingsProps {
  user: { name?: string | null; email?: string | null };
  profile: {
    reportingCurrencyId: string | null;
    currentCountryId: string | null;
    homeCountryId: string | null;
  };
  countries: { id: string; name: string; flag: string | null }[];
  currencies: { id: string; code: string; name: string }[];
}

export function ProfileSettingsForm({ user, profile, countries, currencies }: ProfileSettingsProps) {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportingCurrencyId: profile.reportingCurrencyId || "",
      currentCountryId: profile.currentCountryId || "",
      homeCountryId: profile.homeCountryId || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await updateProfile(data);
      if (!res.success) {
        throw new Error(res.error || "Failed to update profile");
      }
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-2xl shadow-sm border">
      
      {message && (
        <div className={`p-3 text-sm rounded-lg border ${message.type === 'success' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
          {message.text}
        </div>
      )}

      {/* Basic Info (Readonly for now as it comes from NextAuth provider) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input disabled value={user.name || ""} className="bg-muted text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input disabled value={user.email || ""} className="bg-muted text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Financial Preferences</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reportingCurrencyId">Reporting Currency</Label>
            <p className="text-xs text-muted-foreground mb-2">The primary currency for your dashboard and reports.</p>
            <select
              id="reportingCurrencyId"
              className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("reportingCurrencyId")}
            >
              <option value="" disabled>Select currency</option>
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
            {form.formState.errors.reportingCurrencyId && (
              <p className="text-xs text-red-500">{form.formState.errors.reportingCurrencyId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentCountryId">Current Country</Label>
              <select
                id="currentCountryId"
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("currentCountryId")}
              >
                <option value="" disabled>Select country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag ? `${c.flag} ` : ''}{c.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.currentCountryId && (
                <p className="text-xs text-red-500">{form.formState.errors.currentCountryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeCountryId">Home Country</Label>
              <select
                id="homeCountryId"
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("homeCountryId")}
              >
                <option value="" disabled>Select country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag ? `${c.flag} ` : ''}{c.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.homeCountryId && (
                <p className="text-xs text-red-500">{form.formState.errors.homeCountryId.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="submit" 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
