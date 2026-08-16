import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"], {
    message: "Please select a transaction type.",
  }),
  amount: z.number().positive({
    message: "Amount must be a positive number.",
  }),
  currencyId: z.string({
    message: "Please select a currency.",
  }).min(1, "Please select a currency."),
  reportingCurrencyId: z.string({
    message: "Reporting currency is required.",
  }),
  exchangeRate: z.number().positive({
    message: "Exchange rate must be a positive number.",
  }),
  countryId: z.string({
    message: "Please select a country.",
  }).min(1, "Please select a country."),
  categoryId: z.string({
    message: "Please select a category.",
  }).min(1, "Please select a category."),
  date: z.date({
    message: "Please select a date.",
  }),
  paymentMethodId: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
