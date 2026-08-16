import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpensesByCategory } from "@/components/reports/expenses-by-category";
import { IncomeVsExpense } from "@/components/reports/income-vs-expense";

// A set of vibrant colors for the pie chart
const CHART_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", 
  "#f97316", "#eab308", "#22c55e", "#14b8a6", 
  "#0ea5e9", "#6366f1", "#d946ef"
];

export default async function ReportsPage() {
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

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
    include: { category: true },
  });

  // Aggregation 1: Expenses by Category
  const expensesByCategoryMap: Record<string, number> = {};
  
  transactions.forEach(tx => {
    if (tx.type === "EXPENSE") {
      const catName = tx.category.name;
      expensesByCategoryMap[catName] = (expensesByCategoryMap[catName] || 0) + Number(tx.convertedAmount);
    }
  });

  const expensesByCategoryData = Object.entries(expensesByCategoryMap)
    .sort((a, b) => b[1] - a[1]) // Sort largest first
    .map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));

  // Aggregation 2: Income vs Expense by Month
  const incomeVsExpenseMap: Record<string, { income: number; expense: number }> = {};

  transactions.forEach(tx => {
    if (tx.type === "TRANSFER") return; // Skip transfers for income vs expense

    // e.g. "Aug 2026"
    const monthYear = tx.date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    
    if (!incomeVsExpenseMap[monthYear]) {
      incomeVsExpenseMap[monthYear] = { income: 0, expense: 0 };
    }

    if (tx.type === "INCOME") {
      incomeVsExpenseMap[monthYear].income += Number(tx.convertedAmount);
    } else if (tx.type === "EXPENSE") {
      incomeVsExpenseMap[monthYear].expense += Number(tx.convertedAmount);
    }
  });

  const incomeVsExpenseData = Object.entries(incomeVsExpenseMap).map(([period, data]) => ({
    period,
    income: data.income,
    expense: data.expense,
  }));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Visualize your financial data in {currencyCode}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Expenses by Category */}
        <Card className="flex flex-col border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            <ExpensesByCategory data={expensesByCategoryData} currencyCode={currencyCode} />
          </CardContent>
        </Card>

        {/* Income vs Expense Trend */}
        <Card className="flex flex-col border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Income vs Expense Trend</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            <IncomeVsExpense data={incomeVsExpenseData} currencyCode={currencyCode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
