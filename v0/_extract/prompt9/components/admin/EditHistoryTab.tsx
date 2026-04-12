"use client";

import { mockEditHistory } from "./data";
import { History } from "lucide-react";

export function EditHistoryTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{mockEditHistory.length} recorded edits</p>
      <div className="rounded-lg border border-border overflow-hidden">
        {mockEditHistory.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <History className="w-5 h-5" />
            <span>No edit history found</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Listing</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Field</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Before</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">After</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Editor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockEditHistory.map((e, i) => (
                <tr key={e.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-3 font-medium max-w-[160px] truncate">{e.listing}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{e.field}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground line-through text-xs max-w-[100px] truncate">{e.before}</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium text-xs max-w-[100px] truncate">{e.after}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{e.editor}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums whitespace-nowrap">{e.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
