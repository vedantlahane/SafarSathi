import { memo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALERT_PRIORITY_COLORS, type AlertView } from "../types";

interface AlertListItemProps {
  alert: AlertView;
}

function AlertListItemInner({ alert }: AlertListItemProps) {
  const dotColor =
    ALERT_PRIORITY_COLORS[alert.priority] ?? ALERT_PRIORITY_COLORS.low;

  return (
    <div className="py-3" role="listitem">
      <div className="flex items-start gap-3">
        {/* Priority indicator */}
        <div
          className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-1.5", dotColor)}
          aria-label={`${alert.priority} priority`}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate">{alert.type}</p>
            <time className="flex items-center gap-1 text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span className="text-[10px]">{alert.time}</span>
            </time>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {alert.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export const AlertListItem = memo(AlertListItemInner);