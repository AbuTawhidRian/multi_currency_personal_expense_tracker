import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
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
      <main className="flex-1 w-full pb-20 md:pb-0 relative overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
