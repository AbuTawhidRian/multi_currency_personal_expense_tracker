import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, CreditCard, ArrowRightLeft, SearchX } from "lucide-react";
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
      paymentMethod: true,
    },
  });

  const [countries, currencies, categories, exchangeRates, paymentMethods] = await Promise.all([
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    prisma.currency.findMany({ orderBy: { code: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.exchangeRate.findMany({ where: { userId: session.user.id } }),
    prisma.paymentMethod.findMany({
      where: { OR: [{ userId: session.user.id }, { userId: null }] },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
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
    if (type === "EXPENSE") return { icon: CreditCard, color: "text-rose-500", bg: "bg-rose-500/10" };
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
          <div className="flex flex-col items-center justify-center p-16 bg-muted/20 border border-dashed rounded-2xl text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <SearchX size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No transactions found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn't find any transactions matching your filters. Try adjusting your search or adding a new transaction.
            </p>
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
                  const formattedDateTime = new Date(tx.date).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
                  });

                  return (
                    <Card key={tx.id} className="overflow-hidden bg-card hover:bg-muted/50 border transition-colors cursor-pointer shadow-sm group">
                      <CardContent className="p-3 sm:p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-lg ${bg} ${color}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{tx.category.name}</p>
                              <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                                {tx.country.flag} {tx.country.name}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span>{tx.description || tx.currency.code}</span>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30 hidden sm:inline-block"></span>
                              <span className="text-[10px] opacity-70">{formattedDateTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-base font-mono tracking-tight ${tx.type === 'INCOME' ? 'text-emerald-500' : tx.type === 'EXPENSE' ? 'text-rose-500' : 'text-sky-500'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                            ≈ {convertedNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencyCode}
                          </p>
                        </div>
                        <div className="ml-4 pl-4 border-l border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <TransactionCardActions 
                            transaction={{
                              ...tx,
                              amount: Number(tx.amount),
                              convertedAmount: Number(tx.convertedAmount),
                              exchangeRate: Number(tx.exchangeRate),
                            }}
                            countries={countries}
                            currencies={currencies}
                            categories={categories}
                            reportingCurrencyId={profile.reportingCurrencyId!}
                            customExchangeRates={exchangeRates.map(r => ({
                              fromCurrencyId: r.fromCurrencyId,
                              toCurrencyId: r.toCurrencyId,
                              rate: Number(r.rate)
                            }))}
                            paymentMethods={paymentMethods}
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
