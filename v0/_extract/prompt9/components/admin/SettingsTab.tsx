"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { mockSettings } from "./data";

export function SettingsTab() {
  const [settings, setSettings] = useState(mockSettings);
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: string) => {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {settings.map((s) => (
            <div key={s.key} className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground" htmlFor={s.key}>
                {s.key}
              </label>
              <p className="text-xs text-muted-foreground">{s.description}</p>
              <Input
                id={s.key}
                value={s.value}
                onChange={(e) => update(s.key, e.target.value)}
                className="text-sm"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={save}
        className={`transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-primary hover:bg-primary/90"} text-primary-foreground`}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2" /> Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </>
        )}
      </Button>
    </div>
  );
}
