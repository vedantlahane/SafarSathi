import { AlertTriangle, CheckCircle2, Map, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { AlertView } from "../types";

interface AlertDetailSheetProps {
  open: boolean;
  alert: AlertView | null;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (alertId: number) => void;
  onViewMap: () => void;
}

const SEVERITY_TEXT: Record<AlertView["priority"], string> = {
  critical: "Critical risk detected. Immediate action recommended.",
  high: "High-risk situation. Stay in public, well-lit areas.",
  medium: "Moderate risk. Increase awareness and avoid isolation.",
  low: "Low risk advisory for awareness.",
};

const ACTIONS: Record<AlertView["priority"], string[]> = {
  critical: [
    "Move to nearest safe/public location now.",
    "Keep emergency contacts and SOS ready.",
    "Avoid traveling alone until risk clears.",
  ],
  high: [
    "Avoid low-visibility or isolated routes.",
    "Share your location with a trusted contact.",
    "Keep your phone charged and reachable.",
  ],
  medium: [
    "Stay on main roads and monitored areas.",
    "Review nearest police/hospital ETAs on map.",
    "Avoid unnecessary detours right now.",
  ],
  low: [
    "Continue with normal caution.",
    "Check updates if conditions change.",
    "Keep basic emergency details accessible.",
  ],
};

export function AlertDetailSheet({
  open,
  alert,
  onOpenChange,
  onAcknowledge,
  onViewMap,
}: AlertDetailSheetProps) {
  const severity = alert?.priority ?? "low";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {alert?.type ?? "Alert"}
          </SheetTitle>
          <SheetDescription>{alert?.time ?? ""}</SheetDescription>
        </SheetHeader>

        {alert && (
          <div className="space-y-4 px-4 pb-8">
            <GlassCard level={2} className="rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Severity</p>
                <Badge className="capitalize">{severity}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{SEVERITY_TEXT[severity]}</p>
            </GlassCard>

            <GlassCard level={3} className="rounded-2xl p-4">
              <p className="text-sm font-semibold">Details</p>
              <p className="mt-2 text-xs text-muted-foreground">{alert.message}</p>
            </GlassCard>

            <GlassCard level={3} className="rounded-2xl p-4">
              <p className="text-sm font-semibold">Recommended actions</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {ACTIONS[severity].map((action) => (
                  <li key={action} className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-3.5 w-3.5 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <div className="grid grid-cols-2 gap-2">
              <Button className="h-11 rounded-xl" onClick={onViewMap}>
                <Map className="mr-2 h-4 w-4" />
                View on map
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => onAcknowledge(alert.id)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Acknowledge
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
