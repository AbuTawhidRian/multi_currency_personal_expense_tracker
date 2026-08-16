import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  currentCountryId: z.string().min(1, 'Current country is required'),
  homeCountryId: z.string().min(1, 'Home country is required'),
  reportingCurrencyId: z.string().min(1, 'Reporting currency is required'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { currentCountryId, homeCountryId, reportingCurrencyId } = parsed.data;

    // Create or update the profile
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        currentCountryId,
        homeCountryId,
        reportingCurrencyId,
      },
      create: {
        userId: session.user.id,
        currentCountryId,
        homeCountryId,
        reportingCurrencyId,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error in /api/profile POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        currentCountry: true,
        homeCountry: true,
        reportingCurrency: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error in /api/profile GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
