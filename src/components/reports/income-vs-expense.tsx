"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataPoint {
  period: string;
  income: number;
  expense: number;
}

interface IncomeVsExpenseProps {
  data: DataPoint[];
  currencyCode: string;
}

export function IncomeVsExpense({ data, currencyCode }: IncomeVsExpenseProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No transactions recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis 
          dataKey="period" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
          dy={10}
        />
        <YAxis 
          hide
        />
        <Tooltip
          formatter={(value: any) => [`${Number(value).toLocaleString()} ${currencyCode}`, ""]}
          contentStyle={{ backgroundColor: "#0a0e1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
