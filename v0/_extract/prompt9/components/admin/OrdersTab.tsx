"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ShoppingBag } from "lucide-react";
import { mockOrders } from "./data";

export function OrdersTab() {
  const [orders, setOrders] = useState(mockOrders);

  const resolve = (id: string) => setOrders((prev) => prev.filter((o) => o.id !== id));

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <ShoppingBag className="w-12 h-12 text-accent" />
        <p className="text-lg font-medium">No pending orders</p>
        <p className="text-sm">All payment orders have been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{orders.length} pending order{orders.length !== 1 ? "s" : ""}</p>
      {orders.map((o) => (
        <Card key={o.id} className="transition-shadow hover:shadow-md">
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-semibold truncate">{o.listing}</span>
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 ml-auto shrink-0">
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Buyer: <span className="font-medium text-foreground">{o.buyer}</span>
                  <span className="mx-2">·</span>
                  Amount: <span className="font-bold text-accent">{o.amount}</span>
                  <span className="mx-2">·</span>
                  {o.date}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={() => resolve(o.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => resolve(o.id)}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
