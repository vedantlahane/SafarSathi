import { memo } from "react";
import { Radio, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { formatRelativeTime } from "@/lib/store";
import type { BroadcastView } from "../types";

interface BroadcastListProps {
  broadcasts: BroadcastView[];
}

const PRIORITY_STYLES: Record<string, string> = {
  emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
};

function BroadcastListInner({ broadcasts }: BroadcastListProps) {
  if (broadcasts.length === 0) return null;

  return (
    <section aria-label="Broadcasts" className="space-y-2">
      <div className="flex items-center gap-2">
        <Radio
          className="h-4 w-4 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
        <h2 className="text-sm font-bold">Broadcasts</h2>
        <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[9px] font-bold">
          {broadcasts.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {broadcasts.slice(0, 3).map((b, i) => (
          <GlassCard key={i} level={3} className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold truncate">{b.title}</p>
              <Badge
                className={`text-[10px] shrink-0 ${PRIORITY_STYLES[b.priority] ?? PRIORITY_STYLES.normal}`}
              >
                {b.priority}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {b.message}
            </p>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-[10px]">{formatRelativeTime(b.sentAt)}</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export const BroadcastList = memo(BroadcastListInner);
