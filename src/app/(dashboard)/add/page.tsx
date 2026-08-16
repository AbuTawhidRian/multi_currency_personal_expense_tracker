import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddTransactionForm } from "@/components/transactions/add-transaction-form";

export default async function AddTransactionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.reportingCurrencyId) {
    redirect("/onboarding");
  }

  const [countries, currencies, categories, exchangeRates] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.category.findMany({
      where: { OR: [{ userId: session.user.id }, { isDefault: true }] },
      orderBy: { name: "asc" },
    }),
    prisma.exchangeRate.findMany({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Transaction</h1>
        <p className="text-muted-foreground mt-1">Record a new expense, income, or transfer.</p>
      </div>

      <div className="bg-[#0a0e1a] p-6 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 text-white">
        <AddTransactionForm
          countries={countries}
          currencies={currencies}
          categories={categories}
          reportingCurrencyId={profile.reportingCurrencyId}
          customExchangeRates={exchangeRates.map(r => ({
            fromCurrencyId: r.fromCurrencyId,
            toCurrencyId: r.toCurrencyId,
            rate: Number(r.rate)
          }))}
        />
      </div>
    </div>
  );
}
