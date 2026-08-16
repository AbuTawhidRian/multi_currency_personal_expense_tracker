"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Loader2, Target, AlertTriangle, CheckCircle2, TrendingUp, PiggyBank, DollarSign, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBudget, updateBudget, deleteBudget } from "@/actions/budget";

const formSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  currencyId: z.string().min(1, "Currency is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  period: z.enum(["MONTHLY", "YEARLY"]),
  countryId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export interface BudgetWithProgress {
  id: string;
  amount: number;
  period: "MONTHLY" | "YEARLY";
  category: { id: string; name: string; type: string };
  currency: { id: string; code: string; symbol: string };
  country: { id: string; name: string; flag: string | null } | null;
  spent: number;
  spentConverted: number;
  amountConverted: number;
  percentage: number;
  remaining: number;
}

interface BudgetManagerProps {
  budgets: BudgetWithProgress[];
  categories: { id: string; name: string; type: string }[];
  currencies: { id: string; code: string; symbol: string }[];
  countries: { id: string; name: string; flag: string | null }[];
  reportingCurrencyCode: string;
}

export function BudgetManager({
  budgets,
  categories,
  currencies,
  countries,
  reportingCurrencyCode,
}: BudgetManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only show expense or both categories for budgeting
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE" || c.type === "BOTH");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      currencyId: currencies[0]?.id || "",
      amount: 1000,
      period: "MONTHLY",
      countryId: "",
    },
  });

  const openAddModal = () => {
    setEditingBudget(null);
    form.reset({
      categoryId: expenseCategories[0]?.id || "",
      currencyId: currencies[0]?.id || "",
      amount: 1000,
      period: "MONTHLY",
      countryId: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (budget: BudgetWithProgress) => {
    setEditingBudget(budget);
    form.reset({
      categoryId: budget.category.id,
      currencyId: budget.currency.id,
      amount: budget.amount,
      period: budget.period,
      countryId: budget.country?.id || "",
    });
    setError("");
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (editingBudget) {
        result = await updateBudget(editingBudget.id, data);
      } else {
        result = await createBudget(data);
      }

      if (!result.success) {
        setError(result.error as string);
      } else {
        setModalOpen(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (budget: BudgetWithProgress) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the ${budget.period.toLowerCase()} budget for ${budget.category.name}?`
      )
    )
      return;

    try {
      const res = await deleteBudget(budget.id);
      if (!res.success) {
        alert(res.error);
      }
    } catch {
      alert("Failed to delete budget");
    }
  };

  // Calculate high-level KPIs across all monthly budgets
  const monthlyBudgets = budgets.filter((b) => b.period === "MONTHLY");
  const totalBudgeted = monthlyBudgets.reduce((acc, b) => acc + b.amountConverted, 0);
  const totalSpent = monthlyBudgets.reduce((acc, b) => acc + b.spentConverted, 0);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const totalRemaining = totalBudgeted - totalSpent;

  return (
    <div className="space-y-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets & Limits</h1>
          <p className="text-muted-foreground mt-1">
            Set and track spending limits by category across currencies.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* KPI Overview Cards */}
      {monthlyBudgets.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Budgeted
              </CardTitle>
              <PiggyBank className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBudgeted.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reportingCurrencyCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Spent
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  overallPercentage > 100 ? "text-rose-500" : "text-foreground"
                }`}
              >
                {totalSpent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reportingCurrencyCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Remaining
              </CardTitle>
              <CheckCircle2
                className={`w-4 h-4 ${
                  totalRemaining >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalRemaining >= 0 ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {totalRemaining.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reportingCurrencyCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Budget Usage
              </CardTitle>
              <TrendingUp
                className={`w-4 h-4 ${
                  overallPercentage > 100
                    ? "text-rose-500"
                    : overallPercentage > 80
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  overallPercentage > 100
                    ? "text-rose-500"
                    : overallPercentage > 80
                    ? "text-amber-500"
                    : "text-emerald-500"
                }`}
              >
                {overallPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all monthly budgets</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Active Category Budgets</h2>

        {budgets.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-card text-muted-foreground space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No budgets created yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Take control of your spending by setting monthly or yearly targets for each category.
              </p>
            </div>
            <Button onClick={openAddModal} className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Create your first budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((budget) => {
              const isOver = budget.percentage > 100;
              const isWarning = budget.percentage >= 80 && budget.percentage <= 100;
              const clampedProgress = Math.min(Math.max(budget.percentage, 0), 100);

              // Progress bar gradient styles
              let barColor = "bg-gradient-to-r from-emerald-500 to-teal-400";
              let badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

              if (isOver) {
                barColor = "bg-gradient-to-r from-rose-500 to-red-600";
                badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";
              } else if (isWarning) {
                barColor = "bg-gradient-to-r from-amber-500 to-orange-500";
                badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
              }

              return (
                <Card
                  key={budget.id}
                  className="overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-all duration-200 shadow-sm"
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Header: Category, Scope badge, & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-foreground">
                            {budget.category.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}
                          >
                            {budget.period}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {budget.country ? (
                            <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                              {budget.country.flag} {budget.country.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                              <Globe className="w-3 h-3 text-muted-foreground" /> Global
                            </span>
                          )}
                        </div>
                      </div>

                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          className="w-36 p-1 bg-card/95 backdrop-blur-md border-white/10"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-xs h-8 hover:bg-white/5"
                            onClick={() => openEditModal(budget)}
                          >
                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            onClick={() => handleDelete(budget)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Numbers: Spent vs Total */}
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-bold tracking-tight">
                          {budget.spent.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1.5 font-medium">
                          {budget.currency.code}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Budget: </span>
                        <span className="text-sm font-semibold">
                          {budget.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {budget.currency.code}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${clampedProgress}%` }}
                        />
                      </div>

                      {/* Footer Status Message */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span
                          className={`font-semibold ${
                            isOver
                              ? "text-rose-500"
                              : isWarning
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {budget.percentage.toFixed(1)}% used
                        </span>

                        <span className="text-muted-foreground">
                          {isOver ? (
                            <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" /> Over by{" "}
                              {Math.abs(budget.remaining).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              {budget.currency.code}
                            </span>
                          ) : (
                            <span>
                              {budget.remaining.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              {budget.currency.code} remaining
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[460px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingBudget ? "Edit Budget" : "Create Budget"}
            </DialogTitle>
            <DialogDescription className="text-white/50 text-xs">
              Set a spending limit for a specific category and period.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {error && (
              <div className="p-3 text-xs rounded-lg text-rose-400 bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            {/* Category Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-white/80">Category</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                {...form.register("categoryId")}
              >
                <option value="" disabled className="bg-[#0a0e1a]">
                  Select category
                </option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0a0e1a]">
                    {c.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.categoryId && (
                <p className="text-xs text-rose-400">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Budget Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                {form.formState.errors.amount && (
                  <p className="text-xs text-rose-400">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Currency</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("currencyId")}
                >
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0a0e1a]">
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                {form.formState.errors.currencyId && (
                  <p className="text-xs text-rose-400">
                    {form.formState.errors.currencyId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Period and Country Scope */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Period</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("period")}
                >
                  <option value="MONTHLY" className="bg-[#0a0e1a]">
                    Monthly
                  </option>
                  <option value="YEARLY" className="bg-[#0a0e1a]">
                    Yearly
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Country Scope</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("countryId")}
                >
                  <option value="" className="bg-[#0a0e1a]">
                    Global (All Countries)
                  </option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0a0e1a]">
                      {c.flag ? `${c.flag} ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : editingBudget ? "Update Budget" : "Create Budget"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
