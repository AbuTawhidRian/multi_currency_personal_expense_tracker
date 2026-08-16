"use client";

import { Category } from "@prisma/client";

import { useState } from "react";
import { Plus, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["INCOME", "EXPENSE", "BOTH"]),
});

type FormValues = z.infer<typeof formSchema>;

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "EXPENSE",
    },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    form.reset({ name: "", type: "EXPENSE" });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    form.reset({ name: cat.name, type: cat.type });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, data);
      } else {
        result = await createCategory(data);
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

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) return;
    
    try {
      const res = await deleteCategory(cat.id);
      if (!res.success) {
        alert(res.error);
      }
    } catch {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Categories</h2>
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 bg-card border rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className={`text-xs mt-1 ${cat.type === 'INCOME' ? 'text-emerald-500' : cat.type === 'EXPENSE' ? 'text-rose-500' : 'text-sky-500'}`}>
                {cat.type}
              </p>
            </div>
            
            {cat.userId ? ( // Only allow editing/deleting custom categories (where userId is not null)
              <Popover>
                <PopoverTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" />} >
                  <MoreHorizontal className="h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-40 p-1 flex flex-col bg-card/95 backdrop-blur-md border-white/10">
                  <Button variant="ghost" className="w-full justify-start text-sm h-9 hover:bg-white/5" onClick={() => openEditModal(cat)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => handleDelete(cat)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">Default</span>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
            No custom categories found. Create one to get started!
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0a0e1a] border-white/10 text-white shadow-2xl shadow-black">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm rounded-lg text-rose-500 bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                placeholder="e.g. Coffee, Salary, Rent" 
                className="bg-white/5 border-white/10 focus-visible:ring-primary"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring border-white/10 bg-white/5"
                {...form.register("type")}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="BOTH">Both</option>
              </select>
              {form.formState.errors.type && (
                <p className="text-xs text-rose-500">{form.formState.errors.type.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
