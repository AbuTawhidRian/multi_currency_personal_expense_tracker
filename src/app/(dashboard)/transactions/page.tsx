import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Wallet, CreditCard, ArrowRightLeft } from "lucide-react";

const mockTransactions = [
  {
    id: 1,
    type: "INCOME",
    category: "Salary",
    country: "🇦🇪 UAE",
    amount: "AED 8,000",
    converted: "AED 8,000",
    date: "15 Aug 2026",
    icon: Wallet,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    id: 2,
    type: "EXPENSE",
    category: "Room Rent",
    country: "🇦🇪 UAE",
    amount: "AED 2,000",
    converted: "AED 2,000",
    date: "15 Aug 2026",
    icon: CreditCard,
    color: "text-destructive",
    bg: "bg-destructive/10"
  },
  {
    id: 3,
    type: "TRANSFER",
    category: "Family Support",
    country: "🇧🇩 Bangladesh",
    amount: "BDT 20,000",
    converted: "AED 625",
    date: "15 Aug 2026",
    icon: ArrowRightLeft,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  }
];

export default function TransactionsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">View and filter your financial history.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" />
          </div>
          <div className="bg-card border rounded-md p-2 cursor-pointer hover:bg-muted transition-colors">
            <Filter size={20} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Today</h3>
        
        <div className="space-y-3">
          {mockTransactions.map((tx) => {
            const Icon = tx.icon;
            return (
              <Card key={tx.id} className="overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer border-none shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.bg} ${tx.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{tx.category}</p>
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">{tx.country}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-foreground'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">≈ {tx.converted}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
}
