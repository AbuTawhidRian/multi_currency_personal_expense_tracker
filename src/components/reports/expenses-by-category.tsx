"use client";

import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface ExpensesByCategoryProps {
  data: DataPoint[];
  currencyCode: string;
}

export function ExpensesByCategory({ data, currencyCode }: ExpensesByCategoryProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No expenses recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [`${Number(value).toLocaleString()} ${currencyCode}`, "Amount"]}
          contentStyle={{ backgroundColor: "#0a0e1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
        />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
      </PieChart>
    </ResponsiveContainer>
  );
}
