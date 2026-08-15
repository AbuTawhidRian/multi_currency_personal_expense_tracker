"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, Wallet, ArrowRightLeft, Globe, ReceiptText, Settings, CreditCard, LayoutDashboard } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ReceiptText },
  { name: 'Income', href: '/income', icon: Wallet },
  { name: 'Expenses', href: '/expenses', icon: CreditCard },
  { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Countries', href: '/countries', icon: Globe },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen px-4 py-6 sticky top-0">
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Globe size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight">ExpatFi</span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 py-4">
        <div className="bg-muted p-4 rounded-xl border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporting Currency</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold leading-none">AED</p>
            <p className="text-xs text-muted-foreground mb-0.5">UAE Dirham</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
