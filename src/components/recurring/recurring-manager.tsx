"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  Zap,
  Calendar,
  Wallet,
  CreditCard,
  ArrowRightLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  executeRecurringTransaction,
} from "@/actions/recurring";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  countryId: z.string().min(1, "Country is required"),
  currencyId: z.string().min(1, "Currency is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export interface RecurringWithDetails {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate: string | null;
  description: string | null;
  category: { id: string; name: string; type: string };
  currency: { id: string; code: string; symbol: string };
  country: { id: string; name: string; flag: string | null };
  monthlyEstimated: number;
}

interface RecurringManagerProps {
  items: RecurringWithDetails[];
  categories: { id: string; name: string; type: string }[];
  currencies: { id: string; code: string; symbol: string }[];
  countries: { id: string; name: string; flag: string | null }[];
  reportingCurrencyCode: string;
}

export function RecurringManager({
  items,
  categories,
  currencies,
  countries,
  reportingCurrencyCode,
}: RecurringManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPENSE" | "INCOME" | "TRANSFER">("ALL");
  const [loading, setLoading] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "EXPENSE",
      description: "",
      categoryId: categories[0]?.id || "",
      countryId: countries[0]?.id || "",
      currencyId: currencies[0]?.id || "",
      amount: 100,
      frequency: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedType = form.watch("type");
  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === "BOTH"
  );

  const openAddModal = () => {
    setEditingItem(null);
    form.reset({
      type: "EXPENSE",
      description: "",
      categoryId: categories.find((c) => c.type === "EXPENSE" || c.type === "BOTH")?.id || "",
      countryId: countries[0]?.id || "",
      currencyId: currencies[0]?.id || "",
      amount: 100,
      frequency: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (item: RecurringWithDetails) => {
    setEditingItem(item);
    form.reset({
      type: item.type,
      description: item.description || "",
      categoryId: item.category.id,
      countryId: item.country.id,
      currencyId: item.currency.id,
      amount: item.amount,
      frequency: item.frequency,
      startDate: item.startDate.split("T")[0],
      endDate: item.endDate ? item.endDate.split("T")[0] : null,
    });
    setError("");
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (editingItem) {
        result = await updateRecurringTransaction(editingItem.id, data);
      } else {
        result = await createRecurringTransaction(data);
      }

      if (!result.success) {
        setError(result.error as string);
      } else {
        setModalOpen(false);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: RecurringWithDetails) => {
    if (!window.confirm(`Delete recurring item "${item.description || item.category.name}"?`))
      return;

    try {
      const res = await deleteRecurringTransaction(item.id);
      if (!res.success) {
        alert(res.error);
      }
    } catch {
      alert("Failed to delete recurring item");
    }
  };

  const handleExecuteNow = async (item: RecurringWithDetails) => {
    setExecutingId(item.id);
    setFeedback(null);
    try {
      const res = await executeRecurringTransaction(item.id);
      if (res.success) {
        setFeedback({
          msg: `Successfully posted "${item.description || item.category.name}" for today!`,
          type: "success",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ msg: res.error || "Failed to execute transaction", type: "error" });
      }
    } catch {
      setFeedback({ msg: "An unexpected error occurred", type: "error" });
    } finally {
      setExecutingId(null);
    }
  };

  // Compute KPIs
  const monthlyExpenses = items
    .filter((i) => i.type === "EXPENSE")
    .reduce((acc, i) => acc + i.monthlyEstimated, 0);

  const monthlyIncome = items
    .filter((i) => i.type === "INCOME")
    .reduce((acc, i) => acc + i.monthlyEstimated, 0);

  const netMonthly = monthlyIncome - monthlyExpenses;

  // Filtered view items
  const displayedItems =
    activeTab === "ALL" ? items : items.filter((i) => i.type === activeTab);

  const getTypeIcon = (type: string) => {
    if (type === "INCOME") return <Wallet className="w-4 h-4 text-emerald-500" />;
    if (type === "EXPENSE") return <CreditCard className="w-4 h-4 text-rose-500" />;
    return <ArrowRightLeft className="w-4 h-4 text-sky-500" />;
  };

  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case "MONTHLY":
        return "bg-primary/10 text-primary border-primary/20";
      case "WEEKLY":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "YEARLY":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "DAILY":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recurring & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage rent, salary, software subscriptions, and scheduled remittances.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Recurring
        </Button>
      </div>

      {/* Success/Error banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : null}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-rose-500/10 border-rose-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              Fixed Expenses / Mo
            </CardTitle>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              {monthlyExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reportingCurrencyCode} / month</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              Recurring Income / Mo
            </CardTitle>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {monthlyIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reportingCurrencyCode} / month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Net Recurring Flow
            </CardTitle>
            <RefreshCw className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netMonthly >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {netMonthly.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reportingCurrencyCode} / month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Schedules
            </CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length} items</div>
            <p className="text-xs text-muted-foreground mt-1">Automatic & recurring tracks</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 h-9">
            <TabsTrigger value="ALL" className="text-xs rounded-lg">
              All ({items.length})
            </TabsTrigger>
            <TabsTrigger value="EXPENSE" className="text-xs rounded-lg text-rose-400">
              Expenses
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="text-xs rounded-lg text-emerald-400">
              Income
            </TabsTrigger>
            <TabsTrigger value="TRANSFER" className="text-xs rounded-lg text-sky-400">
              Transfers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {displayedItems.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-card text-muted-foreground space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="font-semibold text-foreground">No recurring transactions found</p>
            <p className="text-sm text-muted-foreground">
              Add your monthly rent, gym membership, salary, or remittance schedules.
            </p>
            <Button onClick={openAddModal} className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Add your first recurring item
            </Button>
          </div>
        ) : (
          displayedItems.map((item) => {
            const isExecuting = executingId === item.id;

            return (
              <Card
                key={item.id}
                className="overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-all duration-200 shadow-sm"
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Type icon & Info */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        item.type === "INCOME"
                          ? "bg-emerald-500/10"
                          : item.type === "EXPENSE"
                          ? "bg-rose-500/10"
                          : "bg-sky-500/10"
                      }`}
                    >
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">
                          {item.description || item.category.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getFrequencyBadge(
                            item.frequency
                          )}`}
                        >
                          {item.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{item.category.name}</span>
                        <span>•</span>
                        <span>
                          {item.country.flag} {item.country.name}
                        </span>
                        <span>•</span>
                        <span>Starts {item.startDate.split("T")[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts & Quick Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0">
                    <div className="text-right">
                      <p
                        className={`font-bold text-base ${
                          item.type === "INCOME"
                            ? "text-emerald-500"
                            : item.type === "EXPENSE"
                            ? "text-rose-500"
                            : "text-sky-500"
                        }`}
                      >
                        {item.type === "INCOME" ? "+" : "-"}
                        {item.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {item.currency.code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ≈{" "}
                        {item.monthlyEstimated.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {reportingCurrencyCode}/mo
                      </p>
                    </div>

                    {/* ⚡ Log Now Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExecuteNow(item)}
                      disabled={isExecuting}
                      className="bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-colors text-xs font-semibold"
                      title="Post this transaction for today"
                    >
                      {isExecuting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-400 mr-1" />
                      )}
                      Log Now
                    </Button>

                    {/* Popover Actions */}
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
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingItem ? "Edit Recurring Template" : "New Recurring Transaction"}
            </DialogTitle>
            <DialogDescription className="text-white/50 text-xs">
              Configure a recurring bill, subscription, or income stream.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {error && (
              <div className="p-3 text-xs rounded-lg text-rose-400 bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            {/* Type selector */}
            <Tabs
              value={selectedType}
              onValueChange={(v) => {
                form.setValue("type", v as "INCOME" | "EXPENSE" | "TRANSFER");
                form.setValue("categoryId", "");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1 h-9">
                <TabsTrigger value="EXPENSE" className="text-xs rounded-lg text-rose-400">
                  Expense
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="text-xs rounded-lg text-emerald-400">
                  Income
                </TabsTrigger>
                <TabsTrigger value="TRANSFER" className="text-xs rounded-lg text-sky-400">
                  Transfer
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-white/80">Description / Name</Label>
              <Input
                placeholder="e.g. Apartment Rent, Netflix, Salary"
                className="bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-rose-400">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
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
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Frequency & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Frequency</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("frequency")}
                >
                  <option value="MONTHLY" className="bg-[#0a0e1a]">
                    Monthly
                  </option>
                  <option value="WEEKLY" className="bg-[#0a0e1a]">
                    Weekly
                  </option>
                  <option value="YEARLY" className="bg-[#0a0e1a]">
                    Yearly
                  </option>
                  <option value="DAILY" className="bg-[#0a0e1a]">
                    Daily
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Category</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("categoryId")}
                >
                  <option value="" disabled className="bg-[#0a0e1a]">
                    Select category
                  </option>
                  {filteredCategories.map((c) => (
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
            </div>

            {/* Country & Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Country</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("countryId")}
                >
                  {countries.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0a0e1a]">
                      {c.flag ? `${c.flag} ` : ""}
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white/80">Start Date</Label>
                <Input
                  type="date"
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                  {...form.register("startDate")}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : editingItem ? "Update Recurring" : "Create Recurring"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
