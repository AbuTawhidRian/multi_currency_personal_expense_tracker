"use client";

import { useState } from "react";
import {
  Printer,
  Download,
  ArrowLeft,
  Calendar,
  Globe,
  Wallet,
  CreditCard,
  ArrowRightLeft,
  TrendingUp,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface StatementTransaction {
  id: string;
  date: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  convertedAmount: number;
  description: string | null;
  category: { name: string };
  country: { name: string; flag: string | null };
  currency: { code: string; symbol: string };
  paymentMethod: { name: string } | null;
}

interface StatementViewProps {
  user: { name?: string | null; email?: string | null };
  profile: {
    currentCountry: { name: string; flag: string | null } | null;
    homeCountry: { name: string; flag: string | null } | null;
    reportingCurrency: { code: string; name: string; symbol: string } | null;
  };
  transactions: StatementTransaction[];
  availableMonths: { value: string; label: string }[];
}

export function StatementView({
  user,
  profile,
  transactions,
  availableMonths,
}: StatementViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    availableMonths[0]?.value || "ALL"
  );

  const currencyCode = profile.reportingCurrency?.code || "USD";

  // Filter transactions by selected period
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedPeriod === "ALL") return true;
    const txMonth = tx.date.substring(0, 7); // "YYYY-MM"
    return txMonth === selectedPeriod;
  });

  // Calculate Summary KPIs
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalTransfers = 0;
  const categorySpendMap: Record<string, number> = {};
  const countrySpendMap: Record<string, { flag: string | null; amount: number }> = {};

  filteredTransactions.forEach((tx) => {
    const amount = tx.convertedAmount;
    if (tx.type === "INCOME") {
      totalIncome += amount;
    } else if (tx.type === "EXPENSE") {
      totalExpenses += amount;
      // Category Breakdown
      categorySpendMap[tx.category.name] = (categorySpendMap[tx.category.name] || 0) + amount;
      // Country Breakdown
      if (!countrySpendMap[tx.country.name]) {
        countrySpendMap[tx.country.name] = { flag: tx.country.flag, amount: 0 };
      }
      countrySpendMap[tx.country.name].amount += amount;
    } else if (tx.type === "TRANSFER") {
      totalTransfers += amount;
    }
  });

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const currentPeriodLabel =
    availableMonths.find((m) => m.value === selectedPeriod)?.label || "All-Time Statement";

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Country",
      "Payment Method",
      "Original Amount",
      "Currency",
      "Converted Amount",
      "Reporting Currency",
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx.date.split("T")[0]}"`,
      `"${tx.type}"`,
      `"${tx.category.name}"`,
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      `"${tx.country.name}"`,
      `"${tx.paymentMethod?.name || "N/A"}"`,
      tx.amount.toFixed(2),
      `"${tx.currency.code}"`,
      tx.convertedAmount.toFixed(2),
      `"${currencyCode}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ExpatFi_Statement_${selectedPeriod === "ALL" ? "AllTime" : selectedPeriod}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          href="/reports"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-card border px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0a0e1a]">
                All-Time Statement
              </option>
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value} className="bg-[#0a0e1a]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-white/10 hover:bg-white/5 text-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          {/* Print to PDF Button */}
          <Button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 text-sm font-semibold"
          >
            <Printer className="mr-2 h-4 w-4" />
            Download PDF / Print
          </Button>
        </div>
      </div>

      {/* Official Statement Paper Card */}
      <div className="bg-card print:bg-white print:text-black border print:border-0 rounded-2xl shadow-xl print:shadow-none p-6 md:p-10 max-w-4xl mx-auto space-y-8 print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-border/60 print:border-black/20">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg print:bg-black print:text-white">
                <Globe size={22} />
              </div>
              <span className="font-bold text-2xl tracking-tight print:text-black">ExpatFi</span>
            </div>
            <p className="text-xs text-muted-foreground print:text-gray-600 mt-1 uppercase tracking-wider font-semibold">
              Official Personal Financial Statement
            </p>
          </div>

          <div className="sm:text-right space-y-1 text-xs text-muted-foreground print:text-gray-700">
            <p className="font-bold text-sm text-foreground print:text-black">
              Statement Period: {currentPeriodLabel}
            </p>
            <p>Generated on: {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</p>
            <p>Reporting Currency: <span className="font-semibold text-foreground print:text-black">{currencyCode}</span></p>
          </div>
        </div>

        {/* User Profile & Residence Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 print:bg-gray-100 print:text-black text-xs">
          <div>
            <span className="text-muted-foreground print:text-gray-600 uppercase font-semibold text-[10px]">
              Account Holder
            </span>
            <p className="font-bold text-sm text-foreground print:text-black mt-0.5">
              {user.name || "User"}
            </p>
            <p className="text-muted-foreground print:text-gray-600 truncate">{user.email}</p>
          </div>

          <div>
            <span className="text-muted-foreground print:text-gray-600 uppercase font-semibold text-[10px]">
              Current Residence
            </span>
            <p className="font-bold text-sm text-foreground print:text-black mt-0.5">
              {profile.currentCountry?.flag} {profile.currentCountry?.name || "Not set"}
            </p>
          </div>

          <div>
            <span className="text-muted-foreground print:text-gray-600 uppercase font-semibold text-[10px]">
              Home Country
            </span>
            <p className="font-bold text-sm text-foreground print:text-black mt-0.5">
              {profile.homeCountry?.flag} {profile.homeCountry?.name || "Not set"}
            </p>
          </div>

          <div>
            <span className="text-muted-foreground print:text-gray-600 uppercase font-semibold text-[10px]">
              Total Records
            </span>
            <p className="font-bold text-sm text-foreground print:text-black mt-0.5">
              {filteredTransactions.length} transactions
            </p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground print:text-gray-700 mb-3">
            Executive Summary ({currencyCode})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border print:border-gray-300 bg-card/60 print:bg-white space-y-1">
              <span className="text-[11px] font-semibold text-emerald-500 print:text-emerald-700 uppercase flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Total Inflows
              </span>
              <p className="text-xl font-bold text-emerald-500 print:text-emerald-700">
                {totalIncome.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border print:border-gray-300 bg-card/60 print:bg-white space-y-1">
              <span className="text-[11px] font-semibold text-rose-500 print:text-rose-700 uppercase flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Total Outflows
              </span>
              <p className="text-xl font-bold text-rose-500 print:text-rose-700">
                {totalExpenses.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border print:border-gray-300 bg-card/60 print:bg-white space-y-1">
              <span className="text-[11px] font-semibold text-sky-500 print:text-sky-700 uppercase flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Remittances
              </span>
              <p className="text-xl font-bold text-sky-500 print:text-sky-700">
                {totalTransfers.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border print:border-gray-300 bg-card/60 print:bg-white space-y-1">
              <span className="text-[11px] font-semibold text-primary print:text-blue-700 uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Net Savings ({savingsRate.toFixed(1)}%)
              </span>
              <p
                className={`text-xl font-bold ${
                  netSavings >= 0 ? "text-emerald-500 print:text-emerald-700" : "text-rose-500 print:text-rose-700"
                }`}
              >
                {netSavings.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Category & Country Distributions Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-gray-700">
              Spending by Category
            </h4>
            <div className="border print:border-gray-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/50 print:bg-gray-100 border-b print:border-gray-300">
                  <tr>
                    <th className="p-2.5 font-semibold">Category</th>
                    <th className="p-2.5 text-right font-semibold">Amount ({currencyCode})</th>
                    <th className="p-2.5 text-right font-semibold">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 print:divide-gray-200">
                  {Object.entries(categorySpendMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amt]) => {
                      const share = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                      return (
                        <tr key={cat}>
                          <td className="p-2.5 font-medium">{cat}</td>
                          <td className="p-2.5 text-right">
                            {amt.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-2.5 text-right text-muted-foreground print:text-gray-600">
                            {share.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  {Object.keys(categorySpendMap).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        No category expenses recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Country Allocation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-gray-700">
              Spending by Country
            </h4>
            <div className="border print:border-gray-300 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/50 print:bg-gray-100 border-b print:border-gray-300">
                  <tr>
                    <th className="p-2.5 font-semibold">Country</th>
                    <th className="p-2.5 text-right font-semibold">Amount ({currencyCode})</th>
                    <th className="p-2.5 text-right font-semibold">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 print:divide-gray-200">
                  {Object.entries(countrySpendMap)
                    .sort((a, b) => b[1].amount - a[1].amount)
                    .map(([name, data]) => {
                      const share = totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0;
                      return (
                        <tr key={name}>
                          <td className="p-2.5 font-medium">
                            {data.flag} {name}
                          </td>
                          <td className="p-2.5 text-right">
                            {data.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-2.5 text-right text-muted-foreground print:text-gray-600">
                            {share.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  {Object.keys(countrySpendMap).length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        No country expenses recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Itemized Transaction Ledger */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-gray-700">
            Itemized Transaction History ({filteredTransactions.length})
          </h4>
          <div className="border print:border-gray-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 print:bg-gray-100 border-b print:border-gray-300">
                <tr>
                  <th className="p-2.5 font-semibold">Date</th>
                  <th className="p-2.5 font-semibold">Type</th>
                  <th className="p-2.5 font-semibold">Category / Description</th>
                  <th className="p-2.5 font-semibold">Country</th>
                  <th className="p-2.5 font-semibold">Payment Method</th>
                  <th className="p-2.5 text-right font-semibold">Amount</th>
                  <th className="p-2.5 text-right font-semibold">Converted ({currencyCode})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 print:divide-gray-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/20 print:hover:bg-transparent">
                    <td className="p-2.5 font-medium text-muted-foreground print:text-gray-600 whitespace-nowrap">
                      {tx.date.split("T")[0]}
                    </td>
                    <td className="p-2.5 font-bold">
                      <span
                        className={
                          tx.type === "INCOME"
                            ? "text-emerald-500 print:text-emerald-700"
                            : tx.type === "EXPENSE"
                            ? "text-rose-500 print:text-rose-700"
                            : "text-sky-500 print:text-sky-700"
                        }
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-medium">
                      <div>{tx.category.name}</div>
                      {tx.description && (
                        <div className="text-[11px] text-muted-foreground print:text-gray-500">
                          {tx.description}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      {tx.country.flag} {tx.country.name}
                    </td>
                    <td className="p-2.5 text-muted-foreground print:text-gray-600 whitespace-nowrap">
                      {tx.paymentMethod?.name || "—"}
                    </td>
                    <td className="p-2.5 text-right font-semibold whitespace-nowrap">
                      {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {tx.currency.code}
                    </td>
                    <td className="p-2.5 text-right font-bold whitespace-nowrap">
                      {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                      {tx.convertedAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currencyCode}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No transactions recorded in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statement Footer */}
        <div className="pt-6 border-t border-border/60 print:border-gray-300 flex items-center justify-between text-[11px] text-muted-foreground print:text-gray-600">
          <p>ExpatFi — Multi-Currency Global Personal Finance Tracker</p>
          <p>End of Statement</p>
        </div>
      </div>
    </div>
  );
}
