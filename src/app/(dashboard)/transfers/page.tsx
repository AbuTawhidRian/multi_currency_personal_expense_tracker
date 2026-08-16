import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Calendar, Send, Repeat } from "lucide-react";
import { TransactionCardActions } from "@/components/transactions/transaction-card-actions";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { Prisma } from "@prisma/client";

export default async function TransfersPage(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const query = searchParams.query || "";

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { reportingCurrency: true, currentCountry: true, homeCountry: true },
  });

  if (!profile?.reportingCurrencyId) {
    redirect("/onboarding");
  }

  const currencyCode = profile.reportingCurrency?.code || "USD";

  // Date boundaries for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const whereClause: Prisma.TransactionWhereInput = {
    userId: session.user.id,
    type: "TRANSFER",
  };

  if (query) {
    whereClause.OR = [
      { description: { contains: query, mode: "insensitive" } },
      { category: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const [transactions, allTransferTxs, countries, currencies, categories, exchangeRates, paymentMethods] =
    await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { date: "desc" },
        include: {
          category: true,
          country: true,
          currency: true,
          paymentMethod: true,
        },
      }),
      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          type: "TRANSFER",
        },
        include: { category: true, country: true },
      }),
      prisma.country.findMany({ orderBy: { name: "asc" } }),
      prisma.currency.findMany({ orderBy: { code: "asc" } }),
      prisma.category.findMany({
        where: {
          OR: [{ userId: session.user.id }, { isDefault: true }],
        },
        orderBy: { name: "asc" },
      }),
      prisma.exchangeRate.findMany({
        where: { userId: session.user.id },
      }),
      prisma.paymentMethod.findMany({
        where: { OR: [{ userId: session.user.id }, { userId: null }] },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      }),
    ]);

  // Compute KPIs
  let monthlyTransfers = 0;
  let allTimeTransfers = 0;

  allTransferTxs.forEach((tx) => {
    const amount = Number(tx.convertedAmount);
    allTimeTransfers += amount;
    const txDate = new Date(tx.date);
    if (txDate >= startOfMonth && txDate <= endOfMonth) {
      monthlyTransfers += amount;
    }
  });

  const transferCount = allTransferTxs.length;

  // Group transactions by date
  const groupedTransactions: Record<string, typeof transactions> = {};
  transactions.forEach((tx) => {
    const dateKey = tx.date.toISOString().split("T")[0];
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    groupedTransactions[dateKey].push(tx);
  });

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const formatGroupHeader = (dateStr: string) => {
    const txDate = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (txDate.toDateString() === today.toDateString()) return "Today";
    if (txDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    return txDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transfers & Remittances</h1>
          <p className="text-muted-foreground mt-1">
            Track money sent home, cross-border remittances, and multi-currency transfers.
          </p>
        </div>
        <AddTransactionModal
          countries={countries}
          currencies={currencies}
          categories={categories}
          reportingCurrencyId={profile.reportingCurrencyId}
          customExchangeRates={exchangeRates.map((r) => ({
            fromCurrencyId: r.fromCurrencyId,
            toCurrencyId: r.toCurrencyId,
            rate: Number(r.rate),
          }))}
          paymentMethods={paymentMethods}
          initialData={{
            type: "TRANSFER",
            amount: 0,
            currencyId: profile.reportingCurrencyId,
            countryId: profile.homeCountryId || countries[0]?.id || "",
            categoryId: categories[0]?.id || "",
            exchangeRate: 1,
            date: new Date().toISOString().split("T")[0],
            description: "Cross-border Remittance",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-sky-500/10 border-sky-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-sky-500 uppercase tracking-wider">
              This Month's Transfers
            </CardTitle>
            <Calendar className="w-4 h-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-sky-500">
              {monthlyTransfers.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currencyCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              All-Time Remitted
            </CardTitle>
            <Send className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">
              {allTimeTransfers.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{currencyCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Operations
            </CardTitle>
            <Repeat className="w-4 h-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transferCount} transfers</div>
            <p className="text-xs text-muted-foreground mt-1">Cross-currency & country transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Activity History */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold tracking-tight">Transfer History</h2>

        {sortedDates.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 border rounded-2xl text-muted-foreground">
            No transfer transactions logged yet.
          </div>
        ) : (
          sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {formatGroupHeader(dateKey)}
              </h3>

              <div className="space-y-2">
                {groupedTransactions[dateKey].map((tx) => {
                  const amountNum = Number(tx.amount);
                  const convertedNum = Number(tx.convertedAmount);

                  return (
                    <Card
                      key={tx.id}
                      className="overflow-hidden hover:bg-muted/50 transition-colors border-none shadow-sm"
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
                            <ArrowRightLeft size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{tx.category.name}</p>
                              <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                                {tx.country.flag} {tx.country.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {tx.description || "Transfer"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-sky-500">
                              {amountNum.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              {tx.currency.code}
                            </p>
                            {tx.currency.code !== currencyCode && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                ≈{" "}
                                {convertedNum.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}
                                {currencyCode}
                              </p>
                            )}
                          </div>

                          <div className="pl-3 border-l border-white/5">
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
                              customExchangeRates={exchangeRates.map((r) => ({
                                fromCurrencyId: r.fromCurrencyId,
                                toCurrencyId: r.toCurrencyId,
                                rate: Number(r.rate),
                              }))}
                              paymentMethods={paymentMethods}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
