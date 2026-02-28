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
  critical: "bg-red-100 text-red-600 border-red-200",
  high: "bg-orange-100 text-orange-600 border-orange-200",
  medium: "bg-amber-100 text-amber-600 border-amber-200",
  low: "bg-emerald-100 text-emerald-600 border-emerald-200",
  info: "bg-blue-100 text-blue-600 border-blue-200",
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
      className={`flex items-start gap-3 p-3 rounded-xl border border-white/60 transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none" : ""} bg-white/60 backdrop-blur-sm`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={`p-2 rounded-lg ${color} border`}>
        {typeIcons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800 truncate">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{description}</p>
        )}
        <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}
