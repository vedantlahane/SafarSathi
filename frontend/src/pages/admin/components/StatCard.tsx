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

const colorMap: Record<string, { bg: string; icon: string; border: string; accent: string }> = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100", accent: "bg-blue-600" },
  red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100", accent: "bg-red-600" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100", accent: "bg-emerald-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100", accent: "bg-amber-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100", accent: "bg-purple-600" },
  slate: { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-100", accent: "bg-slate-600" },
  cyan: { bg: "bg-cyan-50", icon: "text-cyan-600", border: "border-cyan-100", accent: "bg-cyan-600" },
};

export function StatCard({ icon: Icon, label, value, change, changeType, color, onClick }: StatCardProps) {
  const c = colorMap[color] || colorMap.slate;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${c.border} ${c.bg} p-4 ${onClick ? "cursor-pointer hover:shadow-lg transition-all" : ""}`}
      onClick={onClick}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 ${c.accent} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-1">
              {changeType === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {changeType === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={`text-xs ${changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-red-600" : "text-slate-500"}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
