import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, TrendingUp, PieChart } from "lucide-react";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { reportingCurrency: true },
  });

  if (!profile?.reportingCurrencyId) {
    redirect("/onboarding");
  }

  const currencyCode = profile.reportingCurrency?.code || "AED";

  // Get current month date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      country: true,
      category: true,
    },
  });

  const [countries, currencies, categories, exchangeRates, paymentMethods] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.category.findMany({
      where: { OR: [{ userId: session.user.id }, { isDefault: true }] },
      orderBy: { name: "asc" },
    }),
    prisma.exchangeRate.findMany({ where: { userId: session.user.id } }),
    prisma.paymentMethod.findMany({
      where: { OR: [{ userId: session.user.id }, { userId: null }] },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
  ]);

  // Calculate KPIs
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    const amount = Number(tx.convertedAmount);
    if (tx.type === "INCOME") {
      totalIncome += amount;
    } else if (tx.type === "EXPENSE") {
      totalExpenses += amount;
    }
  });

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Calculate Spending by Country
  const spendingByCountry: Record<
    string,
    { name: string; flag: string | null; amount: number; isCurrent: boolean }
  > = {};

  transactions
    .filter((tx) => tx.type === "EXPENSE")
    .forEach((tx) => {
      const countryId = tx.countryId;
      if (!spendingByCountry[countryId]) {
        spendingByCountry[countryId] = {
          name: tx.country.name,
          flag: tx.country.flag,
          amount: 0,
          isCurrent: countryId === profile.currentCountryId,
        };
      }
      spendingByCountry[countryId].amount += Number(tx.convertedAmount);
    });

  const spendingArray = Object.values(spendingByCountry).sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {session.user.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-1">
            Here is your financial overview for{" "}
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <AddTransactionModal
          countries={countries}
          currencies={currencies}
          categories={categories}
          reportingCurrencyId={profile.reportingCurrencyId}
          customExchangeRates={exchangeRates.map(r => ({
            fromCurrencyId: r.fromCurrencyId,
            toCurrencyId: r.toCurrencyId,
            rate: Number(r.rate)
          }))}
          paymentMethods={paymentMethods}
        />
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-80">Total Income</CardTitle>
            <Wallet className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs opacity-80 mt-1">{currencyCode}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-destructive">{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">{currencyCode}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl md:text-3xl font-bold ${savings >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-destructive"}`}>
              {savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currencyCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PieChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{savingsRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Of total income</p>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Country */}
      <div>
        <h2 className="text-xl font-bold mb-4">Spending by Country</h2>
        {spendingArray.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 border rounded-2xl text-muted-foreground">
            No expenses recorded this month yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {spendingArray.map((spending, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{spending.flag}</span>
                    <CardTitle className="text-lg">{spending.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">
                      {spending.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                      <span className="text-lg text-muted-foreground font-normal">{currencyCode}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {spending.isCurrent ? "Current Country" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
