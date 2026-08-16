import { CategoryType } from '@prisma/client';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting database seeding...');

  // 1. Seed Currencies
  const currencies = [
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ];

  console.log('Seeding Currencies...');
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // 2. Seed Countries
  const countries = [
    { name: 'United Arab Emirates', isoCode: 'AE', flag: '🇦🇪' },
    { name: 'Bangladesh', isoCode: 'BD', flag: '🇧🇩' },
    { name: 'United States', isoCode: 'US', flag: '🇺🇸' },
    { name: 'United Kingdom', isoCode: 'GB', flag: '🇬🇧' },
    { name: 'India', isoCode: 'IN', flag: '🇮🇳' },
    { name: 'Saudi Arabia', isoCode: 'SA', flag: '🇸🇦' },
  ];

  console.log('Seeding Countries...');
  for (const c of countries) {
    await prisma.country.upsert({
      where: { isoCode: c.isoCode },
      update: {},
      create: c,
    });
  }

  // 3. Seed Default Categories
  const categories = [
    // Income
    { name: 'Salary', type: CategoryType.INCOME, icon: 'Briefcase', isDefault: true },
    { name: 'Freelance', type: CategoryType.INCOME, icon: 'Laptop', isDefault: true },
    { name: 'Investment', type: CategoryType.INCOME, icon: 'TrendingUp', isDefault: true },
    // Expense
    { name: 'Rent', type: CategoryType.EXPENSE, icon: 'Home', isDefault: true },
    { name: 'Groceries', type: CategoryType.EXPENSE, icon: 'ShoppingCart', isDefault: true },
    { name: 'Transport', type: CategoryType.EXPENSE, icon: 'Car', isDefault: true },
    { name: 'Utilities', type: CategoryType.EXPENSE, icon: 'Zap', isDefault: true },
    { name: 'Entertainment', type: CategoryType.EXPENSE, icon: 'Film', isDefault: true },
    { name: 'Dining Out', type: CategoryType.EXPENSE, icon: 'Coffee', isDefault: true },
    { name: 'Healthcare', type: CategoryType.EXPENSE, icon: 'Activity', isDefault: true },
    // Both
    { name: 'Other', type: CategoryType.BOTH, icon: 'MoreHorizontal', isDefault: true },
  ];

  console.log('Seeding Default Categories...');
  for (const c of categories) {
    // Look up by name to avoid duplicates if seed is run multiple times
    const exists = await prisma.category.findFirst({
      where: { name: c.name, isDefault: true }
    });

    if (!exists) {
      await prisma.category.create({
        data: c
      });
    }
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
