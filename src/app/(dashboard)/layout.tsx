import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopBar } from "@/components/layout/TopBar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { reportingCurrency: true }
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        currencyCode={profile?.reportingCurrency?.code} 
        currencyName={profile?.reportingCurrency?.name} 
      />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <TopBar currencyCode={profile?.reportingCurrency?.code} />
        <main className="flex-1 w-full relative overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
