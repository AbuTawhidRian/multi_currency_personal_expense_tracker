import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  const [countries, currencies] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>
      
      <div className="space-y-6">
        {/* Profile Form */}
        <section>
          <ProfileSettingsForm 
            user={{ name: session.user.name, email: session.user.email }}
            profile={{
              reportingCurrencyId: profile.reportingCurrencyId,
              currentCountryId: profile.currentCountryId,
              homeCountryId: profile.homeCountryId,
            }}
            countries={countries}
            currencies={currencies}
          />
        </section>

        {/* Future Settings Placeholders */}
        <section className="space-y-4 pt-6 border-t">
          <h3 className="font-semibold text-lg px-1">Other Settings</h3>
          
          <Link href="/settings/exchange-rates" className="p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between hover:bg-muted/50 transition-colors group">
            <div>
              <h4 className="font-semibold group-hover:text-primary transition-colors">Exchange Rates</h4>
              <p className="text-sm text-muted-foreground mt-1">Manage your personal exchange rates.</p>
            </div>
            <div className="text-sm border px-3 py-1 rounded-md group-hover:border-primary group-hover:text-primary transition-colors">Manage</div>
          </Link>
          
          <Link href="/settings/payment-methods" className="p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between hover:bg-muted/50 transition-colors group">
            <div>
              <h4 className="font-semibold group-hover:text-primary transition-colors">Payment Methods</h4>
              <p className="text-sm text-muted-foreground mt-1">Manage bank accounts, credit cards, and cash wallets.</p>
            </div>
            <div className="text-sm border px-3 py-1 rounded-md group-hover:border-primary group-hover:text-primary transition-colors">Manage</div>
          </Link>
          
          <Link href="/settings/categories" className="p-5 border rounded-xl bg-card shadow-sm flex items-center justify-between hover:bg-muted/50 transition-colors group">
            <div>
              <h4 className="font-semibold group-hover:text-primary transition-colors">Custom Categories</h4>
              <p className="text-sm text-muted-foreground mt-1">Add or remove your custom categories.</p>
            </div>
            <div className="text-sm border px-3 py-1 rounded-md group-hover:border-primary group-hover:text-primary transition-colors">Manage</div>
          </Link>
        </section>
      </div>
    </div>
  );
}
