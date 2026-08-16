"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Prisma } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createExchangeRate, updateExchangeRate, deleteExchangeRate } from "@/actions/exchange-rate";

const formSchema = z.object({
  fromCurrencyId: z.string().min(1, "From Currency is required"),
  toCurrencyId: z.string().min(1, "To Currency is required"),
  rate: z.number().positive("Rate must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

type ExchangeRateType = {
  id: string;
  rate: Prisma.Decimal;
  fromCurrency: { id: string; code: string; name: string };
  toCurrency: { id: string; code: string; name: string };
};

export function ExchangeRateManager({ 
  rates, 
  currencies 
}: { 
  rates: ExchangeRateType[]; 
  currencies: { id: string; code: string; name: string }[] 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRateType | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromCurrencyId: "",
      toCurrencyId: "",
      rate: 1.0,
    },
  });

  const openAddModal = () => {
    setEditingRate(null);
    form.reset({ fromCurrencyId: "", toCurrencyId: "", rate: 1.0 });
    setModalOpen(true);
  };

  const openEditModal = (rate: ExchangeRateType) => {
    setEditingRate(rate);
    form.reset({ 
      fromCurrencyId: rate.fromCurrency.id, 
      toCurrencyId: rate.toCurrency.id, 
      rate: Number(rate.rate)
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (editingRate) {
        result = await updateExchangeRate(editingRate.id, data);
      } else {
        result = await createExchangeRate(data);
      }
      
      if (!result.success) {
        setError(result.error as string);
      } else {
        setModalOpen(false);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rate: ExchangeRateType) => {
    if (!window.confirm(`Are you sure you want to delete the exchange rate for ${rate.fromCurrency.code} to ${rate.toCurrency.code}?`)) return;
    
    try {
      const res = await deleteExchangeRate(rate.id);
      if (!res.success) {
        alert(res.error);
      }
    } catch {
      alert("Failed to delete exchange rate");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Custom Rates</h2>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Rate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((rate) => (
          <div key={rate.id} className="p-4 bg-card border rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 font-medium">
                <span>{rate.fromCurrency.code}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span>{rate.toCurrency.code}</span>
              </div>
              <p className="text-sm mt-1 text-emerald-500 font-semibold">
                1 {rate.fromCurrency.code} = {Number(rate.rate).toFixed(4)} {rate.toCurrency.code}
              </p>
            </div>
            
            <Popover>
              <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />} >
                <MoreHorizontal className="h-4 w-4" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-1 flex flex-col bg-card/95 backdrop-blur-md border-white/10">
                <Button variant="ghost" className="w-full justify-start text-sm h-9 hover:bg-white/5" onClick={() => openEditModal(rate)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => handleDelete(rate)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        ))}

        {rates.length === 0 && (
          <div className="col-span-full p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
            No custom exchange rates found. Add one to start managing your own rates!
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingRate ? "Edit Exchange Rate" : "New Exchange Rate"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm rounded-lg text-rose-500 bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>From Currency</Label>
              <select
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-white/10 bg-white/5 disabled:opacity-50"
                {...form.register("fromCurrencyId")}
                disabled={!!editingRate}
              >
                <option value="" disabled className="bg-[#0a0e1a]">Select currency</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0a0e1a]">{c.code} - {c.name}</option>
                ))}
              </select>
              {form.formState.errors.fromCurrencyId && (
                <p className="text-xs text-rose-500">{form.formState.errors.fromCurrencyId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>To Currency</Label>
              <select
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-white/10 bg-white/5 disabled:opacity-50"
                {...form.register("toCurrencyId")}
                disabled={!!editingRate}
              >
                <option value="" disabled className="bg-[#0a0e1a]">Select currency</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0a0e1a]">{c.code} - {c.name}</option>
                ))}
              </select>
              {form.formState.errors.toCurrencyId && (
                <p className="text-xs text-rose-500">{form.formState.errors.toCurrencyId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rate</Label>
              <Input 
                type="number"
                step="0.000001"
                placeholder="e.g. 1.2500" 
                className="bg-white/5 border-white/10 focus-visible:ring-primary"
                {...form.register("rate", { valueAsNumber: true })}
              />
              {form.formState.errors.rate && (
                <p className="text-xs text-rose-500">{form.formState.errors.rate.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : editingRate ? "Update Rate" : "Add Rate"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
