"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addTransaction, updateTransaction } from "@/actions/transaction";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive({ message: "Amount must be positive" }),
  currencyId: z.string().min(1, "Currency is required"),
  countryId: z.string().min(1, "Country is required"),
  categoryId: z.string().min(1, "Category is required"),
  exchangeRate: z.number().positive(),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface AddTransactionProps {
  countries: { id: string; name: string; flag: string | null }[];
  currencies: { id: string; code: string; symbol: string }[];
  categories: { id: string; name: string; type: string }[];
  reportingCurrencyId: string;
  onSuccess?: () => void;
  transactionId?: string;
  initialData?: FormValues;
  customExchangeRates?: { fromCurrencyId: string; toCurrencyId: string; rate: number }[];
}

export function AddTransactionForm({ countries, currencies, categories, reportingCurrencyId, onSuccess, transactionId, initialData, customExchangeRates = [] }: AddTransactionProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      type: "EXPENSE",
      amount: 0,
      currencyId: reportingCurrencyId,
      countryId: countries[0]?.id || "",
      categoryId: "",
      exchangeRate: 1,
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentType = form.watch("type");
  // eslint-disable-next-line react-hooks/incompatible-library
  const currentCurrency = form.watch("currencyId");
  const [usingCustomRate, setUsingCustomRate] = React.useState(false);

  React.useEffect(() => {
    // Only auto-populate if we are NOT editing an existing transaction (initialData is empty)
    // or if the user is changing the currency away from the initial one.
    if (currentCurrency && currentCurrency !== reportingCurrencyId && (!initialData || currentCurrency !== initialData.currencyId)) {
      const customRate = customExchangeRates.find(
        (r) => r.fromCurrencyId === currentCurrency && r.toCurrencyId === reportingCurrencyId
      );
      if (customRate) {
        form.setValue("exchangeRate", customRate.rate);
        setUsingCustomRate(true);
      } else {
        setUsingCustomRate(false);
      }
    } else {
      setUsingCustomRate(false);
    }
  }, [currentCurrency, reportingCurrencyId, customExchangeRates, form, initialData]);

  // Filter categories by selected type
  const filteredCategories = categories.filter(
    (c) => c.type === currentType || c.type === "BOTH"
  );

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (transactionId) {
        result = await updateTransaction(transactionId, data);
      } else {
        result = await addTransaction(data);
      }
      
      if (!result.success) {
        setError(result.error as string);
      } else {
        onSuccess?.();
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
          {error}
        </div>
      )}

      {/* Transaction Type */}
      <Tabs
        value={currentType}
        onValueChange={(v) => {
          form.setValue("type", v as "INCOME" | "EXPENSE" | "TRANSFER");
          form.setValue("categoryId", ""); // Reset category when type changes
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-11">
          <TabsTrigger value="INCOME" className="rounded-lg text-emerald-500 data-active:bg-emerald-500/20 data-active:text-emerald-400">Income</TabsTrigger>
          <TabsTrigger value="EXPENSE" className="rounded-lg text-rose-500 data-active:bg-rose-500/20 data-active:text-rose-400">Expense</TabsTrigger>
          <TabsTrigger value="TRANSFER" className="rounded-lg text-sky-500 data-active:bg-sky-500/20 data-active:text-sky-400">Transfer</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="bg-white/5 border-white/10 text-white"
            {...form.register("amount", { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="text-xs text-red-400">{form.formState.errors.amount.message}</p>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currencyId">Currency</Label>
          <select
            id="currencyId"
            className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("currencyId")}
          >
            {currencies.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#080b14] text-white">
                {c.code}
              </option>
            ))}
          </select>
          {form.formState.errors.currencyId && (
            <p className="text-xs text-red-400">{form.formState.errors.currencyId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Reporting Currency (Readonly for now) */}
        <div className="space-y-2">
          <Label>Reporting Currency</Label>
          <select
            disabled
            className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed"
          >
            <option>{currencies.find(c => c.id === reportingCurrencyId)?.code || "Default"}</option>
          </select>
        </div>

        {/* Exchange Rate */}
        <div className="space-y-2">
          <Label htmlFor="exchangeRate">Exchange Rate</Label>
          <Input
            id="exchangeRate"
            type="number"
            step="0.000001"
            placeholder="1.0"
            className="bg-white/5 border-white/10 text-white"
            {...form.register("exchangeRate", { valueAsNumber: true })}
          />
          {usingCustomRate && !form.formState.errors.exchangeRate && (
            <p className="text-xs text-emerald-400">Using custom exchange rate</p>
          )}
          {form.formState.errors.exchangeRate && (
            <p className="text-xs text-red-400">{form.formState.errors.exchangeRate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("categoryId")}
          >
            <option value="" disabled className="bg-[#080b14] text-white/50">Select category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#080b14] text-white">
                {c.name}
              </option>
            ))}
          </select>
          {form.formState.errors.categoryId && (
            <p className="text-xs text-red-400">{form.formState.errors.categoryId.message}</p>
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="countryId">Country</Label>
          <select
            id="countryId"
            className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("countryId")}
          >
            <option value="" disabled className="bg-[#080b14] text-white/50">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#080b14] text-white">
                {c.flag ? `${c.flag} ` : ''}{c.name}
              </option>
            ))}
          </select>
          {form.formState.errors.countryId && (
            <p className="text-xs text-red-400">{form.formState.errors.countryId.message}</p>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          className="bg-white/5 border-white/10 text-white"
          {...form.register("date")}
        />
        {form.formState.errors.date && (
          <p className="text-xs text-red-400">{form.formState.errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="e.g. Weekly Groceries"
          className="bg-white/5 border-white/10 text-white"
          {...form.register("description")}
        />
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        className={`w-full ${
          currentType === "INCOME" 
            ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
            : currentType === "EXPENSE"
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-sky-500 hover:bg-sky-600 text-white"
        }`}
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Saving..." : transactionId ? "Update Transaction" : "Save Transaction"}
      </Button>
    </form>
  );
}
