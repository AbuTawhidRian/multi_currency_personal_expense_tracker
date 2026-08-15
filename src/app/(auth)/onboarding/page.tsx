import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OnboardingPage() {
  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Set up your expat finance preferences</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <Label>Current Country</Label>
          <Select defaultValue="ae">
            <SelectTrigger>
              <SelectValue placeholder="Select current country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ae">🇦🇪 United Arab Emirates</SelectItem>
              <SelectItem value="bd">🇧🇩 Bangladesh</SelectItem>
              <SelectItem value="sa">🇸🇦 Saudi Arabia</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Home Country</Label>
          <Select defaultValue="bd">
            <SelectTrigger>
              <SelectValue placeholder="Select home country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ae">🇦🇪 United Arab Emirates</SelectItem>
              <SelectItem value="bd">🇧🇩 Bangladesh</SelectItem>
              <SelectItem value="sa">🇸🇦 Saudi Arabia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Reporting Currency</Label>
          <Select defaultValue="aed">
            <SelectTrigger>
              <SelectValue placeholder="Select reporting currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aed">AED - UAE Dirham</SelectItem>
              <SelectItem value="bdt">BDT - Bangladeshi Taka</SelectItem>
              <SelectItem value="usd">USD - US Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="button" className="w-full mt-6" render={<Link href="/dashboard" />}>
          Go to Dashboard
        </Button>
      </form>
    </>
  );
}
