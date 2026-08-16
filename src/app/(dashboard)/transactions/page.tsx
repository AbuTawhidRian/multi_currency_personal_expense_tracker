import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CreditCard, ArrowRightLeft } from "lucide-react";
import { TransactionCardActions } from "@/components/transactions/transaction-card-actions";
import { TransactionsFilter } from "@/components/transactions/transactions-filter";
import { Prisma } from "@prisma/client";

export default async function TransactionsPage(props: { searchParams?: Promise<{ query?: string, type?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const query = searchParams.query || "";
  const typeParam = searchParams.type || "ALL";

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

  // Build the dynamic where clause
  const whereClause: Prisma.TransactionWhereInput = {
    userId: session.user.id,
  };

  if (typeParam !== "ALL") {
    whereClause.type = typeParam as any;
  }

  if (query) {
    whereClause.OR = [
      { description: { contains: query, mode: "insensitive" } },
      { category: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    include: {
      category: true,
      country: true,
      currency: true,
    },
  });

  const [countries, currencies, categories, exchangeRates] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.exchangeRate.findMany({ where: { userId: session.user.id } }),
  ]);

  // Group transactions by Date string (YYYY-MM-DD)
  const groupedTransactions: Record<string, typeof transactions> = {};
  
  transactions.forEach(tx => {
    const dateKey = tx.date.toISOString().split("T")[0];
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(tx);
  });

  const formatGroupHeader = (dateStr: string) => {
    const txDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (txDate.toDateString() === today.toDateString()) return "Today";
    if (txDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    return txDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const getTypeStyles = (type: string) => {
    if (type === "INCOME") return { icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (type === "EXPENSE") return { icon: CreditCard, color: "text-destructive", bg: "bg-destructive/10" };
    return { icon: ArrowRightLeft, color: "text-sky-500", bg: "bg-sky-500/10" };
  };

  // Sort groups by date descending
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">View and filter your financial history.</p>
        </div>
        
        <TransactionsFilter />
      </div>

      <div className="space-y-8 mt-6">
        {sortedDates.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 border rounded-2xl text-muted-foreground">
            No transactions found. Add a transaction to get started!
          </div>
        ) : (
          sortedDates.map(dateKey => (
            <div key={dateKey} className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {formatGroupHeader(dateKey)}
              </h3>
              
              <div className="space-y-3">
                {groupedTransactions[dateKey].map((tx) => {
                  const { icon: Icon, color, bg } = getTypeStyles(tx.type);
                  const amountNum = Number(tx.amount);
                  const convertedNum = Number(tx.convertedAmount);

                  return (
                    <Card key={tx.id} className="overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer border-none shadow-sm">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${bg} ${color}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{tx.category.name}</p>
                              <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                                {tx.country.flag} {tx.country.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {tx.description || tx.currency.code}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ≈ {convertedNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyCode}
                          </p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-white/5 flex items-center justify-center">
                          <TransactionCardActions 
                            transaction={tx}
                            countries={countries}
                            currencies={currencies}
                            categories={categories}
                            reportingCurrencyId={profile.reportingCurrencyId!}
                            customExchangeRates={exchangeRates.map(r => ({
                              fromCurrencyId: r.fromCurrencyId,
                              toCurrencyId: r.toCurrencyId,
                              rate: Number(r.rate)
                            }))}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
