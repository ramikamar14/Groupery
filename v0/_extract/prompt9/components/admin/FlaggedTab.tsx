"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldAlert, ShieldOff, X } from "lucide-react";
import { mockFlagged } from "./data";

export function FlaggedTab() {
  const [items, setItems] = useState(mockFlagged);

  const dismiss = (id: string) => setItems((prev) => prev.filter((f) => f.id !== id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <ShieldOff className="w-12 h-12 text-accent" />
        <p className="text-lg font-medium">No flagged users</p>
        <p className="text-sm">All suspicious activity has been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{items.length} flagged user{items.length !== 1 ? "s" : ""}</p>
      {items.map((f) => (
        <Card key={f.id} className="border-orange-200 dark:border-orange-900/50 transition-shadow hover:shadow-md">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-11 w-11 border-2 border-orange-300/50">
                <AvatarFallback className="bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-semibold text-sm">
                  {f.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold">{f.name}</h3>
                  <span className="text-xs text-muted-foreground">{f.email}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.reason}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Flagged: {f.flaggedAt}</span>
                  <span className="flex items-center gap-1">
                    Risk score:
                    <span
                      className={`ml-1 font-bold ${
                        f.riskScore >= 80 ? "text-red-500" : "text-orange-500"
                      }`}
                    >
                      {f.riskScore}/100
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => dismiss(f.id)}>
                  <X className="w-4 h-4 mr-1" /> Dismiss
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => dismiss(f.id)}
                >
                  <ShieldAlert className="w-4 h-4 mr-1" /> Ban User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
