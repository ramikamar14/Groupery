import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CheckCircle2, Clock, Package, Truck, Users, DollarSign, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const STAGES = [
  {
    key: "group_filled",
    label: "Group Filled",
    description: "All slots committed by members",
    icon: Users,
  },
  {
    key: "payments_collected",
    label: "Payments Collected",
    description: "Organizer has collected payment from everyone",
    icon: DollarSign,
  },
  {
    key: "order_placed",
    label: "Order Placed",
    description: "Bulk order submitted to supplier",
    icon: Package,
  },
  {
    key: "shipment_received",
    label: "Shipment Received",
    description: "Goods arrived with organizer",
    icon: Truck,
  },
  {
    key: "distribution_complete",
    label: "Distribution Complete",
    description: "All members received their items",
    icon: CheckCircle2,
  },
] as const;

type Stage = (typeof STAGES)[number]["key"];

interface MilestoneTrackerProps {
  listingId: number;
  isOrganizer: boolean;
  isParticipant: boolean;
}

export function MilestoneTracker({ listingId, isOrganizer, isParticipant }: MilestoneTrackerProps) {
  const { toast } = useToast();

  const { data: milestones = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/listings", listingId, "milestones"],
    queryFn: async () => {
      const r = await fetch(`/api/listings/${listingId}/milestones`, { credentials: "include" });
      if (!r.ok) throw new Error(`Failed to load milestones: ${r.status}`);
      return r.json();
    },
    enabled: !!listingId,
    refetchInterval: 30_000,
  });

  const advanceMutation = useMutation({
    mutationFn: ({ stage, status }: { stage: Stage; status: string }) =>
      apiRequest("POST", `/api/listings/${listingId}/milestones/${stage}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listingId, "milestones"] });
      toast({ title: "Milestone updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const confirmMutation = useMutation({
    mutationFn: (stage: Stage) =>
      apiRequest("POST", `/api/listings/${listingId}/milestones/${stage}/confirm`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listingId, "milestones"] });
      toast({ title: "Confirmed!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const getMilestone = (stage: Stage) => milestones.find((m: any) => m.stage === stage);

  const getStageIndex = () => {
    for (let i = STAGES.length - 1; i >= 0; i--) {
      const m = getMilestone(STAGES[i].key);
      if (m?.status === "completed") return i;
    }
    return -1;
  };

  const completedIndex = getStageIndex();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid="milestone-tracker">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-foreground">Deal Progress</h3>
        {completedIndex >= 0 && (
          <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800">
            Stage {completedIndex + 1} of {STAGES.length}
          </Badge>
        )}
      </div>

      <ol className="relative border-l-2 border-muted ml-3 space-y-0">
        {STAGES.map((stage, idx) => {
          const milestone = getMilestone(stage.key);
          const isCompleted = milestone?.status === "completed";
          const isInProgress = milestone?.status === "in_progress";
          const isPending = !milestone || milestone.status === "pending";
          const isNext = idx === completedIndex + 1;
          const Icon = stage.icon;

          return (
            <li key={stage.key} className="ml-5 pb-5 last:pb-0" data-testid={`milestone-${stage.key}`}>
              <span
                className={cn(
                  "absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full border-2 bg-background",
                  isCompleted && "border-green-500 bg-green-500",
                  isInProgress && "border-blue-500 bg-blue-500",
                  isNext && !isCompleted && !isInProgress && "border-primary bg-primary/10",
                  isPending && !isNext && "border-muted bg-muted"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isInProgress ? (
                  <Clock className="w-3 h-3 text-white" />
                ) : (
                  <Icon className={cn("w-3 h-3", isNext ? "text-primary" : "text-muted-foreground")} />
                )}
              </span>

              <div className="pl-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn(
                    "text-sm font-medium leading-tight",
                    isCompleted && "text-green-700 dark:text-green-400",
                    isInProgress && "text-blue-700 dark:text-blue-400",
                    !isCompleted && !isInProgress && isNext && "text-foreground",
                    !isCompleted && !isInProgress && !isNext && "text-muted-foreground"
                  )}>
                    {stage.label}
                  </p>
                  {isCompleted && (
                    <Badge className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800">
                      Done
                    </Badge>
                  )}
                  {isInProgress && (
                    <Badge className="text-[10px] h-4 px-1.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                      In Progress
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>

                {milestone?.completedAt && isCompleted && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed {formatDistanceToNow(new Date(milestone.completedAt), { addSuffix: true })}
                  </p>
                )}

                {milestone?.notes && (
                  <p className="text-xs text-foreground/80 mt-1 bg-muted/50 rounded px-2 py-1">
                    {milestone.notes}
                  </p>
                )}

                {milestone?.confirmedCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {milestone.confirmedCount} member{milestone.confirmedCount !== 1 ? "s" : ""} confirmed
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {isOrganizer && !isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2"
                      disabled={advanceMutation.isPending}
                      data-testid={`button-advance-${stage.key}`}
                      onClick={() => advanceMutation.mutate({ stage: stage.key, status: "completed" })}
                    >
                      {advanceMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Mark Complete <ChevronRight className="w-3 h-3 ml-0.5" /></>}
                    </Button>
                  )}

                  {isParticipant && isCompleted && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2 text-muted-foreground"
                      disabled={confirmMutation.isPending}
                      data-testid={`button-confirm-${stage.key}`}
                      onClick={() => confirmMutation.mutate(stage.key)}
                    >
                      {confirmMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm I received"}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
