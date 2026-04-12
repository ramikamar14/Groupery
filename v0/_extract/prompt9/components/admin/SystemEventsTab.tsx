"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { mockSystemEvents } from "./data";

const PAGE_SIZE = 4;

const eventTypeLabels: Record<string, string> = {
  all: "All Types",
  verification_changed: "Verification Changed",
  user_banned: "User Banned",
  feature_flag_updated: "Feature Flag Updated",
  report_resolved: "Report Resolved",
  listing_deleted: "Listing Deleted",
  settings_updated: "Settings Updated",
};

const eventColors: Record<string, string> = {
  verification_changed: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  user_banned: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  feature_flag_updated: "bg-accent/15 text-accent",
  report_resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  listing_deleted: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  settings_updated: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function SystemEventsTab() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);

  const filtered = filter === "all" ? mockSystemEvents : mockSystemEvents.filter((e) => e.type === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleFilter = (val: string) => {
    setFilter(val);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={handleFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(eventTypeLabels).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        {paged.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Activity className="w-5 h-5" />
            <span>No events found</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Target</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Detail</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((e, i) => (
                <tr key={e.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${eventColors[e.type] ?? "bg-muted text-muted-foreground"}`}>
                      {e.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{e.actor}</td>
                  <td className="px-4 py-3 font-medium">{e.target}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.detail}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums whitespace-nowrap">{e.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
