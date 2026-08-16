"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  CreditCard,
  Wallet,
  Landmark,
  Smartphone,
  CheckCircle2,
  DollarSign,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/actions/payment-method";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export interface PaymentMethodItem {
  id: string;
  name: string;
  isDefault: boolean;
  userId: string | null;
  transactionCount?: number;
}

interface PaymentMethodManagerProps {
  paymentMethods: PaymentMethodItem[];
}

export function PaymentMethodManager({ paymentMethods }: PaymentMethodManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentMethodItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const openAddModal = () => {
    setEditingItem(null);
    form.reset({ name: "" });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (item: PaymentMethodItem) => {
    setEditingItem(item);
    form.reset({ name: item.name });
    setError("");
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (editingItem) {
        result = await updatePaymentMethod(editingItem.id, data);
      } else {
        result = await createPaymentMethod(data);
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

  const handleDelete = async (item: PaymentMethodItem) => {
    if (!window.confirm(`Are you sure you want to delete payment method "${item.name}"?`))
      return;

    try {
      const res = await deletePaymentMethod(item.id);
      if (!res.success) {
        alert(res.error);
      }
    } catch {
      alert("Failed to delete payment method");
    }
  };

  const getMethodIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("card") || lower.includes("visa") || lower.includes("mastercard")) {
      return <CreditCard className="w-5 h-5 text-indigo-400" />;
    }
    if (lower.includes("bank") || lower.includes("checking") || lower.includes("savings")) {
      return <Landmark className="w-5 h-5 text-sky-400" />;
    }
    if (
      lower.includes("wallet") ||
      lower.includes("pay") ||
      lower.includes("bkash") ||
      lower.includes("wise") ||
      lower.includes("paypal")
    ) {
      return <Smartphone className="w-5 h-5 text-emerald-400" />;
    }
    if (lower.includes("cash")) {
      return <DollarSign className="w-5 h-5 text-amber-400" />;
    }
    return <Wallet className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configured Accounts & Methods</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage physical cash, bank accounts, digital wallets, and credit cards.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Method
        </Button>
      </div>

      {/* Grid of Payment Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const isSystem = method.userId === null || method.isDefault;

          return (
            <Card
              key={method.id}
              className="p-4 bg-card border border-border/60 rounded-xl shadow-sm hover:border-primary/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  {getMethodIcon(method.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{method.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isSystem ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                        Default
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isSystem && (
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
                      onClick={() => openEditModal(method)}
                    >
                      <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-xs h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      onClick={() => handleDelete(method)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingItem ? "Edit Payment Method" : "New Payment Method"}
            </DialogTitle>
            <DialogDescription className="text-white/50 text-xs">
              e.g. "HSBC Salary Account", "bKash Mobile Wallet", or "Cash".
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {error && (
              <div className="p-3 text-xs rounded-lg text-rose-400 bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-white/80">Account / Card Name</Label>
              <Input
                placeholder="e.g. Emirates NBD Credit Card"
                className="bg-white/5 border-white/10 text-white focus-visible:ring-primary"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-rose-400">{form.formState.errors.name.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : editingItem ? "Update Method" : "Add Payment Method"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
