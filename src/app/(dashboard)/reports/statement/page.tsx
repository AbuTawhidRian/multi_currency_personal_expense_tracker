import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  StatementView,
  StatementTransaction,
} from "@/components/reports/statement-view";

export default async function StatementPage() {
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

  const transactionsRaw = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    include: {
      category: true,
      country: true,
      currency: true,
      paymentMethod: true,
    },
  });

  const transactions: StatementTransaction[] = transactionsRaw.map((tx) => ({
    id: tx.id,
    date: tx.date.toISOString(),
    type: tx.type as "INCOME" | "EXPENSE" | "TRANSFER",
    amount: Number(tx.amount),
    convertedAmount: Number(tx.convertedAmount),
    description: tx.description,
    category: { name: tx.category.name },
    country: { name: tx.country.name, flag: tx.country.flag },
    currency: { code: tx.currency.code, symbol: tx.currency.symbol },
    paymentMethod: tx.paymentMethod ? { name: tx.paymentMethod.name } : null,
  }));

  // Build available month options from transactions
  const monthSet = new Set<string>();
  transactionsRaw.forEach((tx) => {
    const yyyyMm = tx.date.toISOString().substring(0, 7);
    monthSet.add(yyyyMm);
  });

  // Always include current month
  const nowStr = new Date().toISOString().substring(0, 7);
  monthSet.add(nowStr);

  const availableMonths = Array.from(monthSet)
    .sort((a, b) => b.localeCompare(a))
    .map((yyyyMm) => {
      const [year, month] = yyyyMm.split("-");
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return { value: yyyyMm, label };
    });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <StatementView
        user={{ name: session.user.name ?? null, email: session.user.email ?? null }}
        profile={{
          currentCountry: profile.currentCountry,
          homeCountry: profile.homeCountry,
          reportingCurrency: profile.reportingCurrency,
        }}
        transactions={transactions}
        availableMonths={availableMonths}
      />
    </div>
  );
}
