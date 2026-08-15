import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>
      <div className="space-y-4">
        <div className="p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between">
           <div>
             <h3 className="font-semibold">Profile</h3>
             <p className="text-sm text-muted-foreground mt-1">Muhammad (muhammad@example.com)</p>
           </div>
           <Button variant="outline">Edit</Button>
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between">
           <div>
             <h3 className="font-semibold">Exchange Rates</h3>
             <p className="text-sm text-muted-foreground mt-1">Manage your personal exchange rates.</p>
           </div>
           <Button variant="outline">Manage</Button>
        </div>
        <div className="p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between">
           <div>
             <h3 className="font-semibold">Countries & Currencies</h3>
             <p className="text-sm text-muted-foreground mt-1">Active: UAE, Bangladesh, Saudi Arabia</p>
           </div>
           <Button variant="outline">Manage</Button>
        </div>
      </div>
    </div>
  );
}
