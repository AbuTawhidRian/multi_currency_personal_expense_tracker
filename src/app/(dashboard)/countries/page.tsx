import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Home, MapPin, Receipt, PieChart } from "lucide-react";

export default async function CountriesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      reportingCurrency: true,
      currentCountry: true,
      homeCountry: true,
    },
  });

  if (!profile?.reportingCurrencyId) {
    redirect("/onboarding");
  }

  const currencyCode = profile.reportingCurrency?.code || "USD";

  const [transactions, countries] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: {
        country: true,
        category: true,
      },
    }),
    prisma.country.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Aggregate spending and metrics per country
  let totalOverallSpend = 0;
  const countryMetricsMap: Record<
    string,
    {
      country: (typeof countries)[0];
      totalSpend: number;
      txCount: number;
      categories: Record<string, number>;
    }
  > = {};

  transactions
    .filter((tx) => tx.type === "EXPENSE")
    .forEach((tx) => {
      const amount = Number(tx.convertedAmount);
      totalOverallSpend += amount;

      if (!countryMetricsMap[tx.countryId]) {
        countryMetricsMap[tx.countryId] = {
          country: tx.country,
          totalSpend: 0,
          txCount: 0,
          categories: {},
        };
      }

      countryMetricsMap[tx.countryId].totalSpend += amount;
      countryMetricsMap[tx.countryId].txCount += 1;

      const catName = tx.category.name;
      countryMetricsMap[tx.countryId].categories[catName] =
        (countryMetricsMap[tx.countryId].categories[catName] || 0) + amount;
    });

  // Convert to sorted list
  const countryStats = Object.values(countryMetricsMap)
    .map((item) => {
      let topCategory = "N/A";
      let topCatAmount = 0;
      Object.entries(item.categories).forEach(([cat, amt]) => {
        if (amt > topCatAmount) {
          topCatAmount = amt;
          topCategory = cat;
        }
      });

      const percentage = totalOverallSpend > 0 ? (item.totalSpend / totalOverallSpend) * 100 : 0;
      const isCurrent = item.country.id === profile.currentCountryId;
      const isHome = item.country.id === profile.homeCountryId;

      return {
        country: item.country,
        totalSpend: item.totalSpend,
        txCount: item.txCount,
        percentage,
        topCategory,
        isCurrent,
        isHome,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);

  // Active countries count
  const activeCountriesCount = countryStats.length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Country Portfolios & Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Compare your expenditures and lifestyle costs between host, home, and travel destinations.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-primary uppercase tracking-wider">
              Current Residence
            </CardTitle>
            <MapPin className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{profile.currentCountry?.flag}</span>
              <span className="text-xl font-bold">{profile.currentCountry?.name || "Not set"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Primary base of living & expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/10 border-sky-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-sky-500 uppercase tracking-wider">
              Home Country
            </CardTitle>
            <Home className="w-4 h-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{profile.homeCountry?.flag}</span>
              <span className="text-xl font-bold">{profile.homeCountry?.name || "Not set"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Remittance & home financial ties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Countries
            </CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCountriesCount} countries</div>
            <p className="text-xs text-muted-foreground mt-1">
              With logged expenses and transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Country Spending Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Spending by Country</h2>

        {countryStats.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-card text-muted-foreground space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <p className="font-semibold text-foreground">No country spending recorded yet</p>
            <p className="text-sm text-muted-foreground">
              Log transactions with country locations to see your cross-border spending distribution.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countryStats.map((item) => (
              <Card
                key={item.country.id}
                className="overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-all duration-200 shadow-sm"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Country Header & Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.country.flag}</span>
                      <div>
                        <h3 className="font-bold text-base text-foreground">{item.country.name}</h3>
                        <span className="text-xs text-muted-foreground">{item.country.isoCode}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full">
                          Current Base
                        </span>
                      )}
                      {item.isHome && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/25 px-2 py-0.5 rounded-full">
                          Home Country
                        </span>
                      )}
                      {!item.isCurrent && !item.isHome && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          Travel & Other
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Spending Numbers */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-bold tracking-tight">
                        {item.totalSpend.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                        {currencyCode}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-primary">
                        {item.percentage.toFixed(1)}% of total
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  {/* Country Details Footer */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{item.txCount} transactions</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                      <PieChart className="w-3.5 h-3.5" />
                      <span className="truncate">Top: {item.topCategory}</span>
                    </div>
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
