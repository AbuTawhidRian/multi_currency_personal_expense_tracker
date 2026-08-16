import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryManager } from "@/components/settings/category-manager";

export default async function CategoriesSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all categories for this user, OR default categories (where userId is null)
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null },
      ]
    },
    orderBy: [
      { userId: 'asc' }, // Defaults first (null)
      { name: 'asc' }
    ]
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Link>
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Custom Categories</h1>
        <p className="text-muted-foreground mt-1">Manage your custom income and expense categories.</p>
      </div>

      <div className="pt-4">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
