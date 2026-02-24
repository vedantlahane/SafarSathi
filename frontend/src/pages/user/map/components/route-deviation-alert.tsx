import { AlertTriangle, RotateCw, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RouteDeviationAlertProps {
  visible: boolean;
  onRecalculate: () => void;
  onDismiss: () => void;
}

export function RouteDeviationAlert({ visible, onRecalculate, onDismiss }: RouteDeviationAlertProps) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-52 left-4 right-4 z-[1001]">
      <Card className="border-0 bg-red-50/95 dark:bg-red-950/60 backdrop-blur-xl shadow-xl">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">Route deviation detected</p>
            <p className="text-[10px] text-red-600">Return to the safest path or recalculate.</p>
          </div>
          <Button size="sm" className="h-8 gap-1" onClick={onRecalculate}>
            <RotateCw className="h-3.5 w-3.5" />
            Recalc
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
