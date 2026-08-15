"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, ArrowRightLeft, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, Muhammad</h1>
        <p className="text-muted-foreground mt-1">Here is your financial overview for August 2026</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium opacity-80">Total Income</CardTitle>
            <Wallet className="w-4 h-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">8,000</div>
            <p className="text-xs opacity-80 mt-1">AED</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-destructive">4,906.25</div>
            <p className="text-xs text-muted-foreground mt-1">AED</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-500">3,093.75</div>
            <p className="text-xs text-muted-foreground mt-1">AED</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <PieChartIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">38.66%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Country */}
      <div>
        <h2 className="text-xl font-bold mb-4">Spending by Country</h2>
        <div className="grid md:grid-cols-2 gap-4">
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇦🇪</span>
                <CardTitle className="text-lg">United Arab Emirates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">3,500 <span className="text-lg text-muted-foreground font-normal">AED</span></p>
                <p className="text-sm text-muted-foreground mt-1">Current Country</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Rent</span>
                  <span className="font-medium">AED 2,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Food</span>
                  <span className="font-medium">AED 800</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transport</span>
                  <span className="font-medium">AED 400</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🇧🇩</span>
                <CardTitle className="text-lg">Bangladesh</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold">1,406.25 <span className="text-lg text-muted-foreground font-normal">AED</span></p>
                <p className="text-sm text-emerald-600 mt-1">≈ BDT 45,000</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Family Support</span>
                  <div className="text-right">
                    <span className="font-medium block">BDT 20,000</span>
                    <span className="text-xs text-muted-foreground">≈ AED 625</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Home Expense</span>
                  <div className="text-right">
                    <span className="font-medium block">BDT 15,000</span>
                    <span className="text-xs text-muted-foreground">≈ AED 468.75</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
