import { AlertTriangle, MapPin, User, Shield, Radio, Settings, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ActivityType = "alert" | "tourist" | "zone" | "police" | "broadcast" | "system";

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date | string;
  severity?: "critical" | "high" | "medium" | "low" | "info";
  onClick?: () => void;
}

const typeIcons: Record<ActivityType, React.ReactNode> = {
  alert: <AlertTriangle className="w-4 h-4" />,
  tourist: <User className="w-4 h-4" />,
  zone: <MapPin className="w-4 h-4" />,
  police: <Shield className="w-4 h-4" />,
  broadcast: <Radio className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
};

const severityColors: Record<string, string> = {
  critical: "bg-red-100/50 text-red-600 border-red-200/30",
  high: "bg-orange-100/50 text-orange-600 border-orange-200/30",
  medium: "bg-amber-100/50 text-amber-600 border-amber-200/30",
  low: "bg-emerald-100/50 text-emerald-600 border-emerald-200/30",
  info: "bg-blue-100/50 text-blue-600 border-blue-200/30",
};

export function ActivityItem({
  type,
  title,
  description,
  timestamp,
  severity = "info",
  onClick,
}: ActivityItemProps) {
  const color = severityColors[severity] || severityColors.info;
  let timeAgo: string;
  try {
    timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    timeAgo = "unknown";
  }

  return (
    <div
      className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-200 ${onClick ? "cursor-pointer hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none" : ""} glass-thin border border-white/30`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={`p-1.5 rounded-lg ${color} border`}>
        {typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[13px] leading-tight text-slate-800 truncate">{title}</p>
        {description && (
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{description}</p>
        )}
        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400/80">
          <Clock className="w-2.5 h-2.5" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
