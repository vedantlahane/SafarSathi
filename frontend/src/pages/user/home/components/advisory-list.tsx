import { memo } from "react";
import { ShieldAlert, AlertTriangle, Info, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { formatRelativeTime } from "@/lib/store";
import type { AdvisoryView } from "../types";

interface AdvisoryListProps {
  advisories: AdvisoryView[];
}

const SEVERITY_CONFIG: Record<string, { icon: typeof Info; class: string; label: string }> = {
  critical: {
    icon: ShieldAlert,
    class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    label: "High",
  },
  medium: {
    icon: AlertTriangle,
    class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    label: "Medium",
  },
  low: {
    icon: Info,
    class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    label: "Low",
  },
};

function AdvisoryListInner({ advisories }: AdvisoryListProps) {
  if (advisories.length === 0) return null;

  return (
    <section aria-label="Travel advisories" className="space-y-2">
      <div className="flex items-center gap-2">
        <ShieldAlert
          className="h-4 w-4 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
        <h2 className="text-sm font-bold">Travel Advisories</h2>
        <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[9px] font-bold">
          {advisories.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {advisories.slice(0, 3).map((a) => {
          const config = SEVERITY_CONFIG[a.severity] ?? SEVERITY_CONFIG.low;
          const SeverityIcon = config.icon;

          return (
            <GlassCard key={a.id} level={3} className="p-3.5 space-y-2">
              <div className="flex items-start gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                  style={{
                    backgroundColor:
                      "color-mix(in oklch, var(--theme-primary) 10%, transparent)",
                  }}
                >
                  <SeverityIcon className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{a.title}</p>
                    <Badge className={`text-[10px] shrink-0 ${config.class}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {a.description}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {a.region}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(a.issuedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

export const AdvisoryList = memo(AdvisoryListInner);
