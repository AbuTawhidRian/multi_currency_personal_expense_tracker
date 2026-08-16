"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PieChart, Wallet, ArrowRightLeft, Globe, ReceiptText, Settings, CreditCard, LayoutDashboard, LogOut, Target, RefreshCw } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ReceiptText },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Recurring', href: '/recurring', icon: RefreshCw },
  { name: 'Income', href: '/income', icon: Wallet },
  { name: 'Expenses', href: '/expenses', icon: CreditCard },
  { name: 'Transfers', href: '/transfers', icon: ArrowRightLeft },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'Countries', href: '/countries', icon: Globe },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ currencyCode = 'AED', currencyName = 'UAE Dirham' }: { currencyCode?: string, currencyName?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

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

        <div className="mt-4 px-1">
          <Link href="/add" className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2.5 rounded-lg transition-colors font-medium shadow-md shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Transaction
          </Link>
        </div>
      </nav>
      
      <div className="mt-auto space-y-3 px-2 py-4">
        <div className="bg-muted p-4 rounded-xl border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reporting Currency</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold leading-none">{currencyCode}</p>
            <p className="text-xs text-muted-foreground mb-0.5">{currencyName}</p>
          </div>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

