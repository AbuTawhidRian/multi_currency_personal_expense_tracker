import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  RecurringManager,
  RecurringWithDetails,
} from "@/components/recurring/recurring-manager";

export default async function RecurringPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { reportingCurrency: true },
  });

  if (!profile?.reportingCurrencyId) {
    redirect("/onboarding");
  }

  const reportingCurrencyCode = profile.reportingCurrency?.code || "USD";

  const [recurringRaw, categories, currencies, countries, exchangeRates] = await Promise.all([
    prisma.recurringTransaction.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
        currency: true,
        country: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: {
        OR: [{ userId: session.user.id }, { isDefault: true }],
      },
      orderBy: { name: "asc" },
    }),
    prisma.currency.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.country.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.exchangeRate.findMany({
      where: { userId: session.user.id },
    }),
  ]);

  // Convert amount to reporting currency
  const convertToReporting = (amount: number, currencyId: string): number => {
    if (currencyId === profile.reportingCurrencyId) return amount;
    const directRate = exchangeRates.find(
      (r) => r.fromCurrencyId === currencyId && r.toCurrencyId === profile.reportingCurrencyId
    );
    if (directRate) return amount * Number(directRate.rate);
    const inverseRate = exchangeRates.find(
      (r) => r.fromCurrencyId === profile.reportingCurrencyId && r.toCurrencyId === currencyId
    );
    if (inverseRate && Number(inverseRate.rate) > 0) return amount / Number(inverseRate.rate);
    return amount;
  };

  const getMonthlyMultiplier = (freq: string): number => {
    switch (freq) {
      case "DAILY":
        return 30;
      case "WEEKLY":
        return 4.333;
      case "MONTHLY":
        return 1;
      case "YEARLY":
        return 1 / 12;
      default:
        return 1;
    }
  };

  const items: RecurringWithDetails[] = recurringRaw.map((item) => {
    const rawAmount = Number(item.amount);
    const inReporting = convertToReporting(rawAmount, item.currencyId);
    const multiplier = getMonthlyMultiplier(item.frequency);
    const monthlyEstimated = inReporting * multiplier;

    return {
      id: item.id,
      type: item.type as "INCOME" | "EXPENSE" | "TRANSFER",
      amount: rawAmount,
      frequency: item.frequency as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
      startDate: item.startDate.toISOString(),
      endDate: item.endDate ? item.endDate.toISOString() : null,
      description: item.description,
      category: {
        id: item.category.id,
        name: item.category.name,
        type: item.category.type,
      },
      currency: {
        id: item.currency.id,
        code: item.currency.code,
        symbol: item.currency.symbol,
      },
      country: {
        id: item.country.id,
        name: item.country.name,
        flag: item.country.flag,
      },
      monthlyEstimated,
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <RecurringManager
        items={items}
        categories={categories}
        currencies={currencies}
        countries={countries}
        reportingCurrencyCode={reportingCurrencyCode}
      />
    </div>
  );
}
