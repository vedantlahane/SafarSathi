import { AlertTriangle, CheckCircle2, MapPin, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "../types";

interface NavigationHeaderProps {
  visible: boolean;
  distanceRemaining: number | null;
  etaMinutes: number | null;
  safetyScore: number | null;
  arrived: boolean;
  onDismissArrival: () => void;
}

export function NavigationHeader({
  visible,
  distanceRemaining,
  etaMinutes,
  safetyScore,
  arrived,
  onDismissArrival,
}: NavigationHeaderProps) {
  if (!visible) return null;

  return (
    <div className="absolute top-[120px] left-4 right-4 z-[999]">
      <Card className="shadow-lg border-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
            {arrived ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <MapPin className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {arrived ? "Arrived" : "Active Navigation"}
            </p>
            <p className="text-sm font-semibold">
              {arrived ? "You have arrived safely" : "Stay on safest route"}
            </p>
          </div>
          {!arrived && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[9px] gap-1">
                <Timer className="h-3 w-3" />
                {etaMinutes ?? "–"} min
              </Badge>
              <Badge variant="secondary" className="text-[9px] gap-1">
                {distanceRemaining !== null ? formatDistance(distanceRemaining) : "–"}
              </Badge>
              {typeof safetyScore === "number" && (
                <Badge
                  variant="secondary"
                  className={
                    safetyScore >= 80
                      ? "text-[9px] bg-emerald-100 text-emerald-700"
                      : safetyScore >= 50
                      ? "text-[9px] bg-amber-100 text-amber-700"
                      : "text-[9px] bg-red-100 text-red-700"
                  }
                >
                  {safetyScore}
                </Badge>
              )}
            </div>
          )}
          {arrived && (
            <Button size="sm" variant="outline" className="h-8" onClick={onDismissArrival}>
              Dismiss
            </Button>
          )}
        </CardContent>
      </Card>
      {arrived && (
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] text-emerald-700">
          <AlertTriangle className="h-3 w-3" />
          Keep SOS ready if you feel unsafe.
        </div>
      )}
    </div>
  );
}
