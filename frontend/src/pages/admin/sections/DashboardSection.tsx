import { useMemo } from "react";
import {
  AlertTriangle,
  Users,
  Shield,
  MapPin,
  Activity,
  TrendingUp,
  Timer,
  CheckCircle,
  Wifi,
  WifiOff,
  Database,
  Clock,
  Zap,
  Hospital,
  FileWarning,
  BarChart3,
  Megaphone,
  Siren,
  UserX,
  MapPinOff,
  Navigation,
  ChevronRight,
  Gauge,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard, InteractiveMap, ActivityItem } from "../components";
import type { AdminData, Alert, RiskZone } from "../types";
import { formatDistanceToNow } from "date-fns";

interface DashboardSectionProps {
  data: AdminData;
  onNavigate: (tab: string) => void;
  onAlertClick?: (alert: Alert) => void;
  onZoneClick?: (zone: RiskZone) => void;
  onBroadcast?: () => void;
}

export function DashboardSection({
  data,
  onNavigate,
  onAlertClick,
  onZoneClick,
  onBroadcast,
}: DashboardSectionProps) {
  const { stats, alerts = [], tourists = [], zones = [], policeUnits: police = [] } = data || {};

  const quickStats = useMemo(() => ({
    activeAlerts: alerts.filter((a) => a.status === "ACTIVE").length,
    pendingAlerts: alerts.filter((a) => a.status === "PENDING").length,
    resolvedAlerts: alerts.filter((a) => a.status === "RESOLVED").length,
    onlineTourists: tourists.filter((t) => t.isActive).length,
    highRiskTourists: tourists.filter((t) => t.riskLevel === "high").length,
    activeZones: zones.filter((z) => z.isActive).length,
    criticalZones: zones.filter((z) => z.severity === "critical").length,
    activePolice: police.filter((p) => p.isActive).length,
    activeTouristCount: stats?.activeTouristCount ?? tourists.filter((t) => t.isActive).length,
    avgResponseTimeMs: stats?.avgResponseTimeMs ?? 0,
  }), [alerts, tourists, zones, police, stats]);

  const recentAlerts = useMemo(() =>
    [...alerts]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5),
    [alerts]
  );

  const recentActivity = useMemo(() => {
    const activities: { type: "alert" | "tourist" | "zone" | "police"; title: string; description: string; timestamp: Date; severity: string }[] = [];

    recentAlerts.forEach((alert) => {
      activities.push({
        type: "alert",
        title: `${alert.type.replaceAll("_", " ")} Alert`,
        description: `${alert.touristName || "Unknown tourist"}${alert.assignedUnit ? ` → ${alert.assignedUnit}` : ""}`,
        timestamp: new Date(alert.timestamp),
        severity: alert.status === "ACTIVE" ? "critical" : alert.status === "PENDING" ? "high" : "info",
      });
    });

    // Add zone activities
    zones.filter(z => z.isActive && z.severity === "critical").slice(0, 2).forEach((zone) => {
      activities.push({
        type: "zone",
        title: "Critical Zone Active",
        description: `${zone.name} · ${zone.radius}m radius`,
        timestamp: new Date(),
        severity: "critical",
      });
    });

    // High-risk tourist activities
    tourists.filter(t => t.riskLevel === "high" || t.riskLevel === "critical").slice(0, 3).forEach((t) => {
      activities.push({
        type: "tourist",
        title: `${t.riskLevel === "critical" ? "Critical" : "High"} Risk Tourist`,
        description: `${t.name} · Score ${t.riskScore}`,
        timestamp: new Date(t.lastSeen),
        severity: t.riskLevel === "critical" ? "critical" : "high",
      });
    });

    // Add police status changes
    const offDutyCount = police.filter(p => !p.isActive).length;
    if (offDutyCount > 0) {
      activities.push({
        type: "police",
        title: `${offDutyCount} Station${offDutyCount > 1 ? "s" : ""} Off Duty`,
        description: "Police coverage gap detected",
        timestamp: new Date(),
        severity: offDutyCount > 2 ? "high" : "medium",
      });
    }

    // Active police
    const onDutyCount = police.filter(p => p.isActive).length;
    if (onDutyCount > 0) {
      activities.push({
        type: "police",
        title: `${onDutyCount} Station${onDutyCount > 1 ? "s" : ""} Active`,
        description: "Normal coverage maintained",
        timestamp: new Date(),
        severity: "low",
      });
    }

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }, [recentAlerts, zones, police, tourists]);

  // Dynamic system status derived from actual data
  const systemStatus = useMemo(() => {
    const hasData = alerts.length > 0 || tourists.length > 0;
    const hasActiveAlerts = quickStats.activeAlerts > 0;
    const totalPolice = police.length;
    const coveragePercent = totalPolice > 0 ? Math.round((quickStats.activePolice / totalPolice) * 100) : 0;
    const totalAlerts = alerts.length;
    const resolvedPercent = totalAlerts > 0 ? Math.round((quickStats.resolvedAlerts / totalAlerts) * 100) : 100;
    return {
      api: hasData ? "Online" : "Checking...",
      apiOk: hasData,
      database: hasData ? "Healthy" : "Checking...",
      dbOk: hasData,
      alerts: hasActiveAlerts ? `${quickStats.activeAlerts} Active` : "All Clear",
      alertsOk: !hasActiveAlerts,
      coverage: quickStats.activePolice > 0 ? `${quickStats.activePolice}/${totalPolice}` : "No Coverage",
      coverageOk: quickStats.activePolice > 0,
      coveragePercent,
      resolvedPercent,
      responseTime: quickStats.avgResponseTimeMs > 0 ? Math.round(quickStats.avgResponseTimeMs / 1000) : null,
      totalTourists: tourists.length,
      activeTourists: quickStats.onlineTourists,
      touristPercent: tourists.length > 0 ? Math.round((quickStats.onlineTourists / tourists.length) * 100) : 0,
    };
  }, [alerts, tourists, quickStats, police]);

  // Alert type icon mapping
  const getAlertTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("sos")) return <Siren className="w-3.5 h-3.5 text-red-500" />;
    if (t.includes("geofence") || t.includes("zone")) return <MapPinOff className="w-3.5 h-3.5 text-purple-500" />;
    if (t.includes("speed") || t.includes("movement")) return <Navigation className="w-3.5 h-3.5 text-amber-500" />;
    if (t.includes("inactive") || t.includes("missing")) return <UserX className="w-3.5 h-3.5 text-orange-500" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  };

  const getAlertBorderColor = (status: string) => {
    if (status === "ACTIVE") return "border-l-red-500";
    if (status === "PENDING") return "border-l-amber-500";
    if (status === "RESOLVED") return "border-l-emerald-500";
    return "border-l-slate-300";
  };

  return (
    <div className="p-4 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={quickStats.activeAlerts}
          change={quickStats.pendingAlerts > 0 ? `${quickStats.pendingAlerts} pending` : undefined}
          changeType={quickStats.pendingAlerts > 0 ? "up" : "neutral"}
          color="red"
          onClick={() => onNavigate("alerts")}
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved"
          value={quickStats.resolvedAlerts}
          color="green"
          onClick={() => onNavigate("alerts")}
        />
        <StatCard
          icon={Users}
          label="Online Tourists"
          value={quickStats.onlineTourists}
          change={`${tourists.length} total`}
          changeType="neutral"
          color="blue"
          onClick={() => onNavigate("tourists")}
        />
        <StatCard
          icon={Activity}
          label="High Risk"
          value={quickStats.highRiskTourists}
          color={quickStats.highRiskTourists > 0 ? "red" : "green"}
          onClick={() => onNavigate("tourists")}
        />
        <StatCard
          icon={MapPin}
          label="Active Zones"
          value={quickStats.activeZones}
          change={quickStats.criticalZones > 0 ? `${quickStats.criticalZones} critical` : undefined}
          changeType={quickStats.criticalZones > 0 ? "up" : "neutral"}
          color="purple"
          onClick={() => onNavigate("zones")}
        />
        <StatCard
          icon={Shield}
          label="Police On Duty"
          value={quickStats.activePolice}
          change={`${police.length} total`}
          changeType="neutral"
          color="green"
          onClick={() => onNavigate("police")}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Tourists"
          value={stats?.totalTourists || tourists.length}
          color="cyan"
          onClick={() => onNavigate("tourists")}
        />
        <StatCard
          icon={Timer}
          label="Avg Response"
          value={quickStats.avgResponseTimeMs > 0 ? `${Math.round(quickStats.avgResponseTimeMs / 1000)}s` : "—"}
          color="blue"
        />
      </div>

      {/* ── Map + Activity Feed Row ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Section */}
        <Card className="lg:col-span-2 overflow-hidden glass-elevated border-white/30 shadow-none!" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2 px-4 border-b border-slate-200/30">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                Live Map Overview
                <span className="text-[10px] font-normal text-slate-400 ml-1">
                  {zones.length} zones · {tourists.filter(t => t.isActive).length} tourists
                </span>
              </span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 hover:bg-white/40" onClick={() => onNavigate("zones")}>
                  Zones <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <div className="h-96">
            <InteractiveMap
              zones={zones}
              tourists={tourists}
              alerts={alerts}
              policeUnits={police}
              onZoneClick={onZoneClick}
              showPolice={true}
              showTourists={true}
              showAlerts={true}
            />
          </div>
        </Card>

        {/* Activity Feed */}
        <Card className="glass-card border-white/30 shadow-none!" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2 px-4 border-b border-slate-200/30">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Live Feed
                <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded-full">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  Real-time
                </span>
              </span>
              {onBroadcast && (
                <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 hover:bg-white/40" onClick={onBroadcast}>
                  <Megaphone className="w-3 h-3 mr-1" />
                  Broadcast
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-96">
            <div className="p-2.5 space-y-1.5">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, idx) => (
                  <ActivityItem
                    key={idx}
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    timestamp={activity.timestamp}
                    severity={activity.severity as any}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-[11px] text-slate-400/70 mt-0.5">Activity will appear here in real-time</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Bottom Row: Alerts / System Status + Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Recent Alerts (enhanced) ────────────────────── */}
        <Card className="glass-card border-white/30 shadow-none!" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2 px-4 border-b border-slate-200/30">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Siren className="w-3.5 h-3.5 text-red-500" />
                Recent Alerts
                {quickStats.activeAlerts > 0 && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50/60 px-1.5 py-0.5 rounded-full animate-pulse">
                    {quickStats.activeAlerts} live
                  </span>
                )}
              </span>
              <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 hover:bg-white/40" onClick={() => onNavigate("alerts")}>
                View All <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-64">
            <div className="p-2.5 space-y-1.5">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => {
                  let timeAgo: string;
                  try {
                    timeAgo = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true });
                  } catch {
                    timeAgo = "Unknown";
                  }
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-2.5 p-2.5 glass-thin rounded-xl cursor-pointer hover:bg-white/50 transition-all duration-200 border border-white/30 border-l-2 ${getAlertBorderColor(alert.status)}`}
                      onClick={() => onAlertClick?.(alert)}
                    >
                      <div className="shrink-0 mt-0.5">
                        {getAlertTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-[12px] leading-tight truncate">
                            {alert.type.replaceAll("_", " ")}
                          </p>
                          {alert.escalationLevel && alert.escalationLevel > 1 && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50/60 px-1 py-0.5 rounded">
                              L{alert.escalationLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {alert.touristName || "Unknown"}{alert.assignedUnit ? ` → ${alert.assignedUnit}` : ""}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo}
                          </span>
                          {alert.responseTimeMs && (
                            <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" />
                              {Math.round(alert.responseTimeMs / 1000)}s
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        alert.status === "ACTIVE" ? "bg-red-100/60 text-red-600" :
                        alert.status === "PENDING" ? "bg-amber-100/60 text-amber-600" :
                        alert.status === "RESOLVED" ? "bg-emerald-100/60 text-emerald-600" :
                        "bg-slate-100/60 text-slate-500"
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-600">All Clear</p>
                  <p className="text-[11px] text-slate-400/70 mt-0.5">No recent alerts to display</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* ── System Health + Metrics ─────────────────────── */}
        <Card className="glass-card border-white/30 shadow-none!" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2 px-4 border-b border-slate-200/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <div className="p-3 space-y-2.5">
            {/* Infrastructure Status Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2.5 rounded-xl glass-thin border ${systemStatus.apiOk ? "bg-emerald-50/30 border-emerald-200/25" : "bg-amber-50/30 border-amber-200/25"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    {systemStatus.apiOk ? <Wifi className="w-2.5 h-2.5 text-emerald-500" /> : <WifiOff className="w-2.5 h-2.5 text-amber-500" />}
                    <p className={`text-[10px] font-medium ${systemStatus.apiOk ? "text-emerald-600" : "text-amber-600"}`}>API</p>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.apiOk ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                </div>
                <p className={`text-sm font-bold ${systemStatus.apiOk ? "text-emerald-700" : "text-amber-700"}`}>{systemStatus.api}</p>
              </div>
              <div className={`p-2.5 rounded-xl glass-thin border ${systemStatus.dbOk ? "bg-blue-50/30 border-blue-200/25" : "bg-amber-50/30 border-amber-200/25"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <Database className={`w-2.5 h-2.5 ${systemStatus.dbOk ? "text-blue-500" : "text-amber-500"}`} />
                    <p className={`text-[10px] font-medium ${systemStatus.dbOk ? "text-blue-600" : "text-amber-600"}`}>Database</p>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStatus.dbOk ? "bg-blue-500" : "bg-amber-500 animate-pulse"}`} />
                </div>
                <p className={`text-sm font-bold ${systemStatus.dbOk ? "text-blue-700" : "text-amber-700"}`}>{systemStatus.database}</p>
              </div>
            </div>

            {/* Coverage Progress */}
            <div className="p-2.5 rounded-xl glass-thin border border-white/25">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-purple-500" />
                  <p className="text-[10px] font-medium text-slate-600">Police Coverage</p>
                </div>
                <p className="text-[11px] font-bold text-purple-700">{systemStatus.coverage}</p>
              </div>
              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-purple-500 to-purple-400 transition-all duration-700"
                  style={{ width: `${systemStatus.coveragePercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">{systemStatus.coveragePercent}% active coverage</p>
            </div>

            {/* Alert Resolution */}
            <div className="p-2.5 rounded-xl glass-thin border border-white/25">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <AlertTriangle className={`w-2.5 h-2.5 ${systemStatus.alertsOk ? "text-emerald-500" : "text-red-500"}`} />
                  <p className="text-[10px] font-medium text-slate-600">Alert Resolution</p>
                </div>
                <p className={`text-[11px] font-bold ${systemStatus.alertsOk ? "text-emerald-700" : "text-red-700"}`}>{systemStatus.alerts}</p>
              </div>
              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${systemStatus.alertsOk ? "bg-linear-to-r from-emerald-500 to-emerald-400" : "bg-linear-to-r from-red-500 to-red-400"}`}
                  style={{ width: `${systemStatus.resolvedPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">{systemStatus.resolvedPercent}% resolved</p>
            </div>

            {/* Tourist Activity */}
            <div className="p-2.5 rounded-xl glass-thin border border-white/25">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 text-cyan-500" />
                  <p className="text-[10px] font-medium text-slate-600">Tourist Activity</p>
                </div>
                <p className="text-[11px] font-bold text-cyan-700">{systemStatus.activeTourists}/{systemStatus.totalTourists}</p>
              </div>
              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${systemStatus.touristPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">{systemStatus.touristPercent}% online right now</p>
            </div>

            {/* Response Time */}
            {systemStatus.responseTime !== null && (
              <div className="flex items-center gap-2 p-2 rounded-lg glass-thin border border-white/25">
                <Zap className="w-3 h-3 text-amber-500" />
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500">Avg Response Time</p>
                </div>
                <p className="text-sm font-bold text-amber-700">{systemStatus.responseTime}s</p>
              </div>
            )}
          </div>
        </Card>

        {/* ── Quick Actions Panel ─────────────────────────── */}
        <Card className="glass-card border-white/30 shadow-none!" style={{boxShadow:'inset 0 0.5px 0 0 rgba(255,255,255,0.8), 0 1px 2px 0 rgba(0,0,0,0.03), 0 4px 16px -4px rgba(0,0,0,0.06), 0 12px 40px -8px rgba(0,0,0,0.04)'}}>
          <CardHeader className="py-2 px-4 border-b border-slate-200/30">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <div className="p-3 space-y-3">
            {/* Primary Actions */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary</p>
              <div className="grid grid-cols-1 gap-1">
                {onBroadcast && (
                  <button
                    onClick={onBroadcast}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl glass-thin border border-white/30 hover:bg-blue-50/30 hover:border-blue-200/40 transition-all group"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-100/50 text-blue-600 group-hover:bg-blue-100/80 transition-colors">
                      <Megaphone className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[12px] font-semibold text-slate-700">Send Broadcast</p>
                      <p className="text-[10px] text-slate-400">Alert all tourists in area</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                )}
                <button
                  onClick={() => onNavigate("alerts")}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl glass-thin border border-white/30 hover:bg-red-50/30 hover:border-red-200/40 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-red-100/50 text-red-600 group-hover:bg-red-100/80 transition-colors">
                    <Siren className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-[12px] font-semibold text-slate-700">Manage Alerts</p>
                    <p className="text-[10px] text-slate-400">{quickStats.activeAlerts} active, {quickStats.pendingAlerts} pending</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </button>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigate</p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onNavigate("zones")}
                  className="flex items-center gap-2 p-2 rounded-xl glass-thin border border-white/30 hover:bg-purple-50/30 transition-all"
                >
                  <MapPin className="w-3 h-3 text-purple-500" />
                  <span className="text-[11px] font-medium text-slate-700">Risk Zones</span>
                </button>
                <button
                  onClick={() => onNavigate("police")}
                  className="flex items-center gap-2 p-2 rounded-xl glass-thin border border-white/30 hover:bg-emerald-50/30 transition-all"
                >
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] font-medium text-slate-700">Police Units</span>
                </button>
                <button
                  onClick={() => onNavigate("tourists")}
                  className="flex items-center gap-2 p-2 rounded-xl glass-thin border border-white/30 hover:bg-blue-50/30 transition-all"
                >
                  <Users className="w-3 h-3 text-blue-500" />
                  <span className="text-[11px] font-medium text-slate-700">Tourists</span>
                </button>
                <button
                  onClick={() => onNavigate("hospitals")}
                  className="flex items-center gap-2 p-2 rounded-xl glass-thin border border-white/30 hover:bg-rose-50/30 transition-all"
                >
                  <Hospital className="w-3 h-3 text-rose-500" />
                  <span className="text-[11px] font-medium text-slate-700">Hospitals</span>
                </button>
                <button
                  onClick={() => onNavigate("advisories")}
                  className="flex items-center gap-2 p-2 rounded-xl glass-thin border border-white/30 hover:bg-amber-50/30 transition-all"
                >
                  <FileWarning className="w-3 h-3 text-amber-500" />
                  <span className="text-[11px] font-medium text-slate-700">Advisories</span>
                </button>
                <button
                  onClick={() => onNavigate("auditlog")}
                  className="flex items-center gap-2 p-2 rounded-xl glass-thin border border-white/30 hover:bg-slate-50/30 transition-all"
                >
                  <BarChart3 className="w-3 h-3 text-slate-500" />
                  <span className="text-[11px] font-medium text-slate-700">Audit Log</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
