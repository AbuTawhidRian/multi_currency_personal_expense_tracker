import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function AddTransactionPage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Transaction</h1>
        <p className="text-muted-foreground mt-1">Record a new expense, income, or transfer.</p>
      </div>

      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expense">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" placeholder="0.00" className="text-2xl font-medium h-12" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="aed">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aed">AED</SelectItem>
                      <SelectItem value="bdt">BDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select defaultValue="ae">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ae">🇦🇪 UAE</SelectItem>
                      <SelectItem value="bd">🇧🇩 Bangladesh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Room Rent</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="family">Family Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg flex justify-between items-center border">
                <div>
                  <p className="text-sm font-medium">Exchange Rate</p>
                  <p className="text-xs text-muted-foreground">1 AED = 1 AED</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Converted</p>
                  <p className="text-lg font-bold">AED 0.00</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <Button className="w-full h-12 text-md mt-4">Save Expense</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income">
          <Card>
            <CardContent className="pt-6 space-y-4">
               <div className="space-y-2">
                <Label>Income Amount</Label>
                <Input type="number" placeholder="0.00" className="text-2xl font-medium h-12" />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select defaultValue="salary">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full h-12 text-md mt-4">Save Income</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer">
           <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Transfer Amount</Label>
                <Input type="number" placeholder="0.00" className="text-2xl font-medium h-12" />
              </div>
              <div className="space-y-2">
                <Label>Destination Country</Label>
                <Select defaultValue="bd">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bd">🇧🇩 Bangladesh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full h-12 text-md mt-4">Send Transfer</Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
