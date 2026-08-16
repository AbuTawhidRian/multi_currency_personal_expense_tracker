"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/transactions": "Transactions",
  "/budgets": "Budgets & Targets",
  "/recurring": "Recurring Payments",
  "/income": "Income",
  "/expenses": "Expenses",
  "/transfers": "Transfers & Remittances",
  "/reports": "Reports & Analytics",
  "/reports/statement": "Financial Statement",
  "/countries": "Country Portfolios",
  "/settings": "Account Settings",
  "/settings/exchange-rates": "Exchange Rates",
  "/settings/payment-methods": "Payment Methods",
  "/settings/categories": "Custom Categories",
  "/add": "Add Transaction",
};

export function TopBar({
  currencyCode = "AED",
}: {
  currencyCode?: string;
}) {
  const pathname = usePathname();
  const pageTitle = ROUTE_NAMES[pathname] || "ExpatFi";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between gap-4 transition-all print:hidden">
      {/* Left: Mobile Brand & Page Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Globe size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">ExpatFi</span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-base font-bold tracking-tight text-foreground">{pageTitle}</h2>
        </div>
      </div>

      {/* Right: Actions & Notification Bell */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-muted/60 border px-2.5 py-1 rounded-lg text-xs font-semibold text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-normal">Base:</span>
          <span className="text-foreground">{currencyCode}</span>
        </div>

        {/* Quick Add Button */}
        <Link href="/add" className="hidden sm:inline-block">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 text-xs font-semibold h-8.5 px-3 rounded-xl"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add
          </Button>
        </Link>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
}
