"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addTransaction } from "@/actions/transaction";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// The schema is similar to the server action schema, but slightly adapted for the form
const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  currencyId: z.string().min(1, "Currency is required"),
  countryId: z.string().min(1, "Country is required"),
  categoryId: z.string().min(1, "Category is required"),
  exchangeRate: z.coerce.number().positive().default(1),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  countries: { id: string; name: string; flag: string | null }[];
  currencies: { id: string; code: string; symbol: string }[];
  categories: { id: string; name: string; type: string }[];
  reportingCurrencyId: string;
}

export function AddTransactionForm({ countries, currencies, categories, reportingCurrencyId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      currencyId: reportingCurrencyId,
      countryId: countries[0]?.id || "",
      categoryId: "",
      exchangeRate: 1,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const currentType = watch("type");
  const currentAmount = watch("amount") || 0;
  const currentCurrencyId = watch("currencyId");
  const currentExchangeRate = watch("exchangeRate") || 1;

  // Derived state
  const isDifferentCurrency = currentCurrencyId !== reportingCurrencyId;
  const convertedAmount = currentAmount * currentExchangeRate;

  // Filter categories by selected type
  const filteredCategories = categories.filter(
    (c) => c.type === currentType || c.type === "BOTH"
  );

  const onSubmit: import("react-hook-form").SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await addTransaction(data);
      if (!res.success) {
        throw new Error(res.error || "Failed to add transaction");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Tabs
        defaultValue="EXPENSE"
        className="w-full"
        onValueChange={(val) => {
          setValue("type", val as any);
          setValue("categoryId", ""); // Reset category when type changes
        }}
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
          <TabsTrigger value="INCOME">Income</TabsTrigger>
          <TabsTrigger value="TRANSFER">Transfer</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm border border-red-500/20">
                  {error}
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount</Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="text-2xl font-medium h-12"
                      {...field}
                    />
                  )}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
              </div>

              {/* Currency and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Controller
                    name="currencyId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.currencyId && <p className="text-sm text-red-500">{errors.currencyId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Controller
                    name="countryId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.flag} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.countryId && <p className="text-sm text-red-500">{errors.countryId.message}</p>}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
              </div>

              {/* Optional Exchange Rate */}
              {isDifferentCurrency && (
                <div className="space-y-2">
                  <Label>Exchange Rate (to Reporting Currency)</Label>
                  <Controller
                    name="exchangeRate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="1.0"
                        {...field}
                      />
                    )}
                  />
                  {errors.exchangeRate && <p className="text-sm text-red-500">{errors.exchangeRate.message}</p>}
                </div>
              )}

              {/* Preview Box */}
              <div className="bg-muted p-4 rounded-lg flex justify-between items-center border">
                <div>
                  <p className="text-sm font-medium">Exchange Rate</p>
                  <p className="text-xs text-muted-foreground">
                    Multiplier: {currentExchangeRate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Converted</p>
                  <p className="text-lg font-bold">
                    {convertedAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Input type="date" {...field} />
                  )}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="E.g., Dinner with friends" {...field} />
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-md mt-4"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Transaction"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
