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

const colorMap: Record<string, { bg: string; icon: string; border: string; accent: string; glow: string; gradient: string }> = {
  blue:   { bg: "bg-blue-500/10",    icon: "text-blue-500",    border: "border-blue-500/20",    accent: "bg-blue-500", glow: "shadow-blue-500/20",    gradient: "from-blue-500/5 to-transparent" },
  red:    { bg: "bg-red-500/10",     icon: "text-red-500",     border: "border-red-500/20",     accent: "bg-red-500",  glow: "shadow-red-500/20",     gradient: "from-red-500/5 to-transparent" },
  green:  { bg: "bg-emerald-500/10", icon: "text-emerald-500", border: "border-emerald-500/20", accent: "bg-emerald-500", glow: "shadow-emerald-500/20", gradient: "from-emerald-500/5 to-transparent" },
  amber:  { bg: "bg-amber-500/10",   icon: "text-amber-500",   border: "border-amber-500/20",   accent: "bg-amber-500", glow: "shadow-amber-500/20",   gradient: "from-amber-500/5 to-transparent" },
  purple: { bg: "bg-purple-500/10",  icon: "text-purple-500",  border: "border-purple-500/20",  accent: "bg-purple-500", glow: "shadow-purple-500/20",  gradient: "from-purple-500/5 to-transparent" },
  slate:  { bg: "bg-slate-500/10",   icon: "text-slate-500",   border: "border-slate-500/20",   accent: "bg-slate-500", glow: "shadow-slate-500/20",   gradient: "from-slate-500/5 to-transparent" },
  cyan:   { bg: "bg-cyan-500/10",    icon: "text-cyan-500",    border: "border-cyan-500/20",    accent: "bg-cyan-500", glow: "shadow-cyan-500/20",    gradient: "from-cyan-500/5 to-transparent" },
};

export function StatCard({ icon: Icon, label, value, change, changeType, color, onClick }: StatCardProps) {
  const c = colorMap[color] || colorMap.slate;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${c.border} p-5 bg-gradient-to-br ${c.gradient} backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.glow} ${onClick ? "cursor-pointer group focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:outline-none" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${c.accent} opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl transition-transform duration-500 group-hover:scale-110`} />
      <div className="flex flex-col justify-between h-full relative z-10">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-2xl ${c.bg} backdrop-blur-md border border-white/10 shadow-sm`}>
            <Icon className={`h-6 w-6 ${c.icon}`} />
          </div>
          {change && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md border ${c.border}`}>
              {changeType === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
              {changeType === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
              <span className={`text-xs font-bold ${changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-red-600" : "text-slate-500"}`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="mt-5">
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}
