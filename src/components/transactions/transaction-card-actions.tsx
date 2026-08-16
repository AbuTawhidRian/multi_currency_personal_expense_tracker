"use client";

import { Transaction } from "@prisma/client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { deleteTransaction } from "@/actions/transaction";
import { AddTransactionForm, AddTransactionProps } from "./add-transaction-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TransactionCardActionsProps extends AddTransactionProps {
  transaction: Transaction;
}

export function TransactionCardActions({ transaction, ...props }: TransactionCardActionsProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
    } catch (e) {
      console.error(e);
      alert("Failed to delete transaction");
    } finally {
      setIsDeleting(false);
      setPopoverOpen(false);
    }
  };

  const handleEdit = () => {
    setPopoverOpen(false);
    setEditModalOpen(true);
  };

  const initialData = {
    type: transaction.type as "INCOME" | "EXPENSE" | "TRANSFER",
    amount: Number(transaction.amount),
    currencyId: transaction.currencyId,
    countryId: transaction.countryId,
    categoryId: transaction.categoryId,
    exchangeRate: Number(transaction.exchangeRate),
    date: new Date(transaction.date).toISOString().split("T")[0],
    description: transaction.description || "",
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" disabled={isDeleting} />} >
          <MoreHorizontal className="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-1 flex flex-col bg-card/95 backdrop-blur-md border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-9 hover:bg-white/5" 
            onClick={handleEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </PopoverContent>
      </Popover>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AddTransactionForm 
              {...props} 
              transactionId={transaction.id}
              initialData={initialData}
              onSuccess={() => setEditModalOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
