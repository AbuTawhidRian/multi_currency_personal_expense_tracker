import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExchangeRateManager } from "@/components/settings/exchange-rate-manager";

export default async function ExchangeRatesSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's custom exchange rates along with currency details
  const rates = await prisma.exchangeRate.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      fromCurrency: true,
      toCurrency: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  const currencies = await prisma.currency.findMany({
    orderBy: {
      code: 'asc'
    }
  });

  // Serialize Decimal to plain number for client component
  const serializedRates = rates.map((r) => ({
    id: r.id,
    rate: Number(r.rate),
    fromCurrency: { id: r.fromCurrency.id, code: r.fromCurrency.code, name: r.fromCurrency.name },
    toCurrency: { id: r.toCurrency.id, code: r.toCurrency.code, name: r.toCurrency.name },
  }));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Link>
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exchange Rates</h1>
        <p className="text-muted-foreground mt-1">Manage your custom exchange rates for transactions and reports.</p>
      </div>

      <div className="pt-4">
        <ExchangeRateManager rates={serializedRates} currencies={currencies} />
      </div>
    </div>
  );
}
