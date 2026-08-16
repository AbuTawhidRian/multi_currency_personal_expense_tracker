import { prisma } from '@/lib/prisma';
import { OnboardingForm } from './onboarding-form';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user already has a profile
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile) {
    redirect('/dashboard');
  }

  const countries = await prisma.country.findMany({
    orderBy: { name: 'asc' },
  });
  
  const currencies = await prisma.currency.findMany({
    orderBy: { code: 'asc' },
  });

  const countryOptions = countries.map(c => ({
    value: c.id,
    label: `${c.flag || ''} ${c.name}`.trim(),
  }));

  const currencyOptions = currencies.map(c => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
          Complete your profile
        </h1>
        <p className="text-sm text-white/45">
          Set up your expat finance preferences
        </p>
      </div>

      <OnboardingForm 
        countryOptions={countryOptions} 
        currencyOptions={currencyOptions} 
      />
    </div>
  );
}
