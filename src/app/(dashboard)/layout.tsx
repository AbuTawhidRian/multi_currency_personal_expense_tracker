import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 w-full pb-20 md:pb-0 relative overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
