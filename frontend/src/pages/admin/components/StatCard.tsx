import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  color: string;
  onClick?: () => void;
}

const colorMap: Record<string, { bg: string; icon: string; border: string; accent: string; glow: string }> = {
  blue:   { bg: "bg-blue-50/40",    icon: "text-blue-600",    border: "border-blue-200/20",    accent: "bg-blue-500", glow: "shadow-blue-500/5"    },
  red:    { bg: "bg-red-50/40",     icon: "text-red-600",     border: "border-red-200/20",     accent: "bg-red-500",  glow: "shadow-red-500/5"     },
  green:  { bg: "bg-emerald-50/40", icon: "text-emerald-600", border: "border-emerald-200/20", accent: "bg-emerald-500", glow: "shadow-emerald-500/5" },
  amber:  { bg: "bg-amber-50/40",   icon: "text-amber-600",   border: "border-amber-200/20",   accent: "bg-amber-500", glow: "shadow-amber-500/5"   },
  purple: { bg: "bg-purple-50/40",  icon: "text-purple-600",  border: "border-purple-200/20",  accent: "bg-purple-500", glow: "shadow-purple-500/5"  },
  slate:  { bg: "bg-slate-50/40",   icon: "text-slate-600",   border: "border-slate-200/20",   accent: "bg-slate-500", glow: "shadow-slate-500/5"   },
  cyan:   { bg: "bg-cyan-50/40",    icon: "text-cyan-600",    border: "border-cyan-200/20",    accent: "bg-cyan-500", glow: "shadow-cyan-500/5"    },
};

export function StatCard({ icon: Icon, label, value, change, changeType, color, onClick }: StatCardProps) {
  const c = colorMap[color] || colorMap.slate;

  return (
    <div
      className={`glass-card relative overflow-hidden rounded-2xl border ${c.border} p-3 card-hover ${c.glow} ${onClick ? "cursor-pointer hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={`absolute top-0 right-0 w-16 h-16 ${c.accent} opacity-[0.04] rounded-full -translate-y-1/2 translate-x-1/2 blur-sm`} />
      <div className="flex items-start justify-between relative">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500/80 uppercase tracking-wider leading-none">{label}</p>
          <p className="text-lg font-bold text-slate-900 mt-1.5 leading-none">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-1.5">
              {changeType === "up" && <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />}
              {changeType === "down" && <TrendingDown className="h-2.5 w-2.5 text-red-500" />}
              <span className={`text-[10px] leading-none ${changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-red-600" : "text-slate-400"}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-1.5 rounded-xl ${c.bg} backdrop-blur-sm`}>
          <Icon className={`h-4 w-4 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
