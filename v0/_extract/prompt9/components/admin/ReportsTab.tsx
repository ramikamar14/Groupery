"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, ShoppingBag, ArrowRight } from "lucide-react";
import { mockReports } from "./data";

const categoryColors: Record<string, string> = {
  fraud: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  harassment: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  spam: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  fake: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  other: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function ReportsTab() {
  const [items, setItems] = useState(mockReports);

  const resolve = (id: string) => setItems((prev) => prev.filter((r) => r.id !== id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <CheckCircle className="w-12 h-12 text-accent" />
        <p className="text-lg font-medium">No open reports</p>
        <p className="text-sm">All reports have been resolved.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{items.length} open report{items.length !== 1 ? "s" : ""}</p>
      {items.map((r) => (
        <Card key={r.id} className="transition-shadow hover:shadow-md">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0 space-y-3">
                {/* Header row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize flex items-center gap-1 text-xs">
                    {r.type === "listing" ? <ShoppingBag className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {r.type}
                  </Badge>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${categoryColors[r.category]}`}>
                    {r.category}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">{r.date}</span>
                </div>

                {/* Reporter → Reported */}
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <div>
                    <span className="text-muted-foreground text-xs block">Reporter</span>
                    <span className="font-medium">{r.reporter.name}</span>
                    <span className="text-muted-foreground"> · {r.reporter.email}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground text-xs block">Reported</span>
                    <span className="font-medium">{r.reported.name}</span>
                    <span className="text-muted-foreground"> · {r.reported.email}</span>
                  </div>
                </div>

                {/* Listing */}
                {r.listing && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Listing: </span>{r.listing}
                  </p>
                )}
              </div>

              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
                onClick={() => resolve(r.id)}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Mark Resolved
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
