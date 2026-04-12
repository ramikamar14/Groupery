"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { mockFeatureFlags } from "./data";

export function FeatureFlagsTab() {
  const [flags, setFlags] = useState(mockFeatureFlags);

  const toggle = (id: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{flags.filter((f) => f.enabled).length} of {flags.length} flags enabled</p>
      {flags.map((f) => (
        <Card key={f.id} className="transition-shadow hover:shadow-sm">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{f.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      f.enabled
                        ? "border-accent text-accent bg-accent/10"
                        : "border-muted-foreground/30 text-muted-foreground"
                    }
                  >
                    {f.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>
              </div>
              <Switch
                checked={f.enabled}
                onCheckedChange={() => toggle(f.id)}
                aria-label={`Toggle ${f.name}`}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
