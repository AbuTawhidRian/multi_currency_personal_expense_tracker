export default function ReportsPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">Detailed financial analysis coming soon.</p>
      </div>
      <div className="h-[400px] w-full border-2 border-dashed border-muted rounded-2xl flex items-center justify-center text-muted-foreground bg-muted/20">
        <div className="text-center">
          <p className="font-medium text-lg">Charts & Analytics</p>
          <p className="text-sm mt-1">Phase 5 Implementation</p>
        </div>
      </div>
    </div>
  );
}
