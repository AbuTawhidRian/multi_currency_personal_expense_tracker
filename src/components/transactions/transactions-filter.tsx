"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function TransactionsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get("query") || "";
  const initialType = searchParams.get("type") || "ALL";

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);

  // Debounced search update
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("query", query);
      } else {
        params.delete("query");
      }
      
      if (type && type !== "ALL") {
        params.set("type", type);
      } else {
        params.delete("type");
      }
      
      router.push(`/transactions?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, type, router, searchParams]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 md:w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search descriptions or categories..." 
          className="pl-9 bg-card"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Popover>
        <PopoverTrigger 
          render={
            <div className={`border rounded-md p-2 cursor-pointer transition-colors flex items-center justify-center ${type !== 'ALL' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-card hover:bg-muted text-muted-foreground'}`} />
          } 
        >
          <Filter size={20} />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-2 flex flex-col gap-1 bg-card/95 backdrop-blur-md">
          <p className="text-xs font-semibold text-muted-foreground mb-1 px-2 uppercase tracking-wider">Type Filter</p>
          <Button 
            variant="ghost" 
            size="sm"
            className={`justify-start ${type === "ALL" ? "bg-white/10" : ""}`}
            onClick={() => setType("ALL")}
          >
            All Transactions
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`justify-start text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 ${type === "INCOME" ? "bg-emerald-500/10" : ""}`}
            onClick={() => setType("INCOME")}
          >
            Income
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`justify-start text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 ${type === "EXPENSE" ? "bg-rose-500/10" : ""}`}
            onClick={() => setType("EXPENSE")}
          >
            Expense
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={`justify-start text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 ${type === "TRANSFER" ? "bg-sky-500/10" : ""}`}
            onClick={() => setType("TRANSFER")}
          >
            Transfer
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
