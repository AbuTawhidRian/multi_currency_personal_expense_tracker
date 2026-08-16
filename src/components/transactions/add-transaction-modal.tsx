"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTransactionForm, AddTransactionProps } from "./add-transaction-form";

export function AddTransactionModal(props: AddTransactionProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 transition-colors rounded-lg font-medium" />
        }
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Log Transaction</DialogTitle>
          <DialogDescription className="text-white/50">
            Record a new income, expense, or cross-border transfer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <AddTransactionForm onSuccess={() => setOpen(false)} {...props} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
