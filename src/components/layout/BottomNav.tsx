"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, PieChart, Plus, Settings } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activity', href: '/transactions', icon: ReceiptText },
  { name: 'Add', href: '/add', icon: Plus, isFab: true },
  { name: 'Reports', href: '/reports', icon: PieChart },
  { name: 'More', href: '/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.isFab) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-5">
                <div className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/25 hover:bg-primary/90 transition-transform active:scale-95">
                  <Icon size={24} />
                </div>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : ''} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
