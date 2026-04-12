"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, FileText, Camera } from "lucide-react";
import { mockVerifications } from "./data";

export function VerificationsTab() {
  const [items, setItems] = useState(mockVerifications);

  const remove = (id: string) => setItems((prev) => prev.filter((v) => v.id !== id));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <CheckCircle className="w-12 h-12 text-accent" />
        <p className="text-lg font-medium">All verifications are up to date</p>
        <p className="text-sm">No pending verification requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{items.length} pending request{items.length !== 1 ? "s" : ""}</p>
      {items.map((v) => (
        <Card key={v.id} className="transition-shadow hover:shadow-md">
          <CardContent className="py-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-11 w-11 border-2 border-accent/30">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                  {v.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{v.name}</h3>
                  <Badge variant="secondary" className="capitalize text-xs">{v.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{v.email}</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <a href={v.idDoc} className="flex items-center gap-1.5 text-accent hover:underline font-medium">
                    <FileText className="w-3.5 h-3.5" /> View ID Document
                  </a>
                  <a href={v.selfie} className="flex items-center gap-1.5 text-accent hover:underline font-medium">
                    <Camera className="w-3.5 h-3.5" /> View Selfie
                  </a>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={() => remove(v.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => remove(v.id)}
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
