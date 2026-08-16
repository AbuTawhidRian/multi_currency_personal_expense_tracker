import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BudgetManager, BudgetWithProgress } from "@/components/budgets/budget-manager";
import { checkBudgetAlerts } from "@/actions/notification";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check budget alerts on page load
  await checkBudgetAlerts(session.user.id);

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { reportingCurrency: true },
  });

  if (!profile?.reportingCurrencyId) {
    redirect("/onboarding");
  }

  const reportingCurrencyCode = profile.reportingCurrency?.code || "USD";

  // Calculate current month and year date boundaries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  // Fetch all necessary data concurrently
  const [budgetsRaw, transactions, categories, currencies, countries, exchangeRates] =
    await Promise.all([
      prisma.budget.findMany({
        where: { userId: session.user.id },
        include: {
          category: true,
          currency: true,
          country: true,
        },
        orderBy: [{ period: "asc" }, { createdAt: "desc" }],
      }),
      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          date: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
        include: {
          currency: true,
        },
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

  // Helper to convert an amount from one currency to reporting currency
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

  // Helper to convert from reporting currency into target budget currency
  const convertFromReporting = (reportingAmount: number, targetCurrencyId: string): number => {
    if (targetCurrencyId === profile.reportingCurrencyId) return reportingAmount;
    const directRate = exchangeRates.find(
      (r) => r.fromCurrencyId === profile.reportingCurrencyId && r.toCurrencyId === targetCurrencyId
    );
    if (directRate) return reportingAmount * Number(directRate.rate);
    const inverseRate = exchangeRates.find(
      (r) => r.fromCurrencyId === targetCurrencyId && r.toCurrencyId === profile.reportingCurrencyId
    );
    if (inverseRate && Number(inverseRate.rate) > 0) return reportingAmount / Number(inverseRate.rate);
    return reportingAmount;
  };

  // Compute progress for each budget
  const budgetsWithProgress: BudgetWithProgress[] = budgetsRaw.map((b) => {
    const budgetAmount = Number(b.amount);
    const isMonthly = b.period === "MONTHLY";
    const startDate = isMonthly ? startOfMonth : startOfYear;
    const endDate = isMonthly ? endOfMonth : endOfYear;

    // Filter relevant expense transactions
    const matchingTransactions = transactions.filter((tx) => {
      if (tx.categoryId !== b.categoryId) return false;
      if (b.countryId && tx.countryId !== b.countryId) return false;
      const txDate = new Date(tx.date);
      return txDate >= startDate && txDate <= endDate;
    });

    // Sum up spent amount in reporting currency
    const spentConverted = matchingTransactions.reduce(
      (sum, tx) => sum + Number(tx.convertedAmount),
      0
    );

    // Calculate spent in budget's specific currency
    let spentInBudgetCurrency = 0;
    matchingTransactions.forEach((tx) => {
      if (tx.currencyId === b.currencyId) {
        spentInBudgetCurrency += Number(tx.amount);
      } else {
        // Convert from transaction convertedAmount (reporting currency) to budget currency
        spentInBudgetCurrency += convertFromReporting(
          Number(tx.convertedAmount),
          b.currencyId
        );
      }
    });

    const amountConverted = convertToReporting(budgetAmount, b.currencyId);
    const percentage = budgetAmount > 0 ? (spentInBudgetCurrency / budgetAmount) * 100 : 0;
    const remaining = budgetAmount - spentInBudgetCurrency;

    return {
      id: b.id,
      amount: budgetAmount,
      period: b.period as "MONTHLY" | "YEARLY",
      category: {
        id: b.category.id,
        name: b.category.name,
        type: b.category.type,
      },
      currency: {
        id: b.currency.id,
        code: b.currency.code,
        symbol: b.currency.symbol,
      },
      country: b.country
        ? {
            id: b.country.id,
            name: b.country.name,
            flag: b.country.flag,
          }
        : null,
      spent: spentInBudgetCurrency,
      spentConverted,
      amountConverted,
      percentage,
      remaining,
    };
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <BudgetManager
        budgets={budgetsWithProgress}
        categories={categories}
        currencies={currencies}
        countries={countries}
        reportingCurrencyCode={reportingCurrencyCode}
      />
    </div>
  );
}
