import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaymentMethodManager } from "@/components/settings/payment-method-manager";

export default async function PaymentMethodsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch payment methods for user OR default ones
  let paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      OR: [{ userId: session.user.id }, { userId: null }],
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  // If no payment methods exist at all, seed standard defaults
  if (paymentMethods.length === 0) {
    const defaultNames = ["Cash", "Bank Account", "Credit Card", "Digital Wallet"];
    await prisma.paymentMethod.createMany({
      data: defaultNames.map((name) => ({
        name,
        isDefault: true,
        userId: null,
      })),
    });

    paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link
        href="/settings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Settings
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Methods</h1>
        <p className="text-muted-foreground mt-1">
          Configure bank accounts, cards, and cash wallets for transaction attribution.
        </p>
      </div>

      <div className="pt-4">
        <PaymentMethodManager paymentMethods={paymentMethods} />
      </div>
    </div>
  );
}
