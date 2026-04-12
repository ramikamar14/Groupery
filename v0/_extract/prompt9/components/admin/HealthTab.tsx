"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Server, Zap, Clock, RefreshCw } from "lucide-react";
import { mockHealthMetrics } from "./data";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
    degraded: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
    down: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900",
  };
  return (
    <Badge variant="outline" className={`capitalize ${styles[status] ?? ""}`}>
      {status}
    </Badge>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export function HealthTab() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const metrics = mockHealthMetrics;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setLastRefresh(new Date());
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Last refreshed: <span className="font-medium">{lastRefresh.toLocaleTimeString()}</span>
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
          Auto-refresh in {countdown}s
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" /> Database
              </span>
              <StatusBadge status={metrics.db.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="Query Latency" value={metrics.db.latency} />
            <MetricRow label="Active Connections" value={metrics.db.connections} />
          </CardContent>
        </Card>

        {/* Server */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4 text-accent" /> Server
              </span>
              <StatusBadge status={metrics.server.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="Uptime" value={metrics.server.uptime} />
            <MetricRow label="CPU Usage" value={metrics.server.cpu} />
            <MetricRow label="Memory" value={metrics.server.memory} />
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" /> API
              </span>
              <StatusBadge status={metrics.api.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="Avg Response Time" value={metrics.api.avgResponse} />
            <MetricRow label="Error Rate" value={metrics.api.errorRate} />
          </CardContent>
        </Card>

        {/* Queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" /> Job Queue
              </span>
              <StatusBadge status={metrics.queue.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <MetricRow label="Pending Jobs" value={metrics.queue.pending} />
            <MetricRow label="Failed Jobs" value={metrics.queue.failed} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
