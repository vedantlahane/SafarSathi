import { useMemo } from "react";
import {
  AlertTriangle,
  Users,
  Shield,
  MapPin,
  Activity,
  TrendingUp,
  Clock,
  Radio,
  Timer,
  UserCheck,
  CheckCircle,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatCard, InteractiveMap, ActivityItem } from "../components";
import type { AdminData, Alert, RiskZone } from "../types";

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
        description: alert.touristName || "Unknown tourist",
        timestamp: new Date(alert.timestamp),
        severity: alert.status === "ACTIVE" ? "critical" : alert.status === "PENDING" ? "high" : "info",
      });
    });

    // Add zone activities
    zones.filter(z => z.isActive && z.severity === "critical").slice(0, 2).forEach((zone) => {
      activities.push({
        type: "zone",
        title: "Critical Zone Active",
        description: zone.name,
        timestamp: new Date(),
        severity: "critical",
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

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  }, [recentAlerts, zones, police]);

  // Dynamic system status derived from actual data
  const systemStatus = useMemo(() => {
    const hasData = alerts.length > 0 || tourists.length > 0;
    const hasActiveAlerts = quickStats.activeAlerts > 0;
    return {
      api: hasData ? "Online" : "Checking...",
      apiOk: hasData,
      database: hasData ? "Healthy" : "Checking...",
      dbOk: hasData,
      alerts: hasActiveAlerts ? `${quickStats.activeAlerts} Active` : "All Clear",
      alertsOk: !hasActiveAlerts,
      coverage: quickStats.activePolice > 0 ? `${quickStats.activePolice} Units` : "No Coverage",
      coverageOk: quickStats.activePolice > 0,
    };
  }, [alerts, tourists, quickStats]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-2 overflow-hidden bg-white/70 backdrop-blur-sm border-white/60">
          <CardHeader className="py-3 px-4 border-b border-slate-200/60">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Live Map Overview
              </span>
              <Button size="sm" variant="outline" onClick={() => onNavigate("zones")}>
                Manage Zones
              </Button>
            </CardTitle>
          </CardHeader>
          <div className="h-[400px]">
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
        <Card className="bg-white/70 backdrop-blur-sm border-white/60">
          <CardHeader className="py-3 px-4 border-b border-slate-200/60">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Recent Activity
              </span>
              {onBroadcast && (
                <Button size="sm" variant="outline" onClick={onBroadcast}>
                  <Radio className="w-3.5 h-3.5 mr-1" />
                  Broadcast
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-2">
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
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Quick Actions & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts Table */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/60">
          <CardHeader className="py-3 px-4 border-b border-slate-200/60">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Recent Alerts
              </span>
              <Button size="sm" variant="ghost" onClick={() => onNavigate("alerts")}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[250px]">
            <div className="p-3 space-y-2">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white/80 transition-all"
                    onClick={() => onAlertClick?.(alert)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${alert.status === "ACTIVE" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                      <div>
                        <p className="font-medium text-sm">{alert.type}</p>
                        <p className="text-xs text-slate-500">{alert.touristName || "Unknown"}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${alert.status === "ACTIVE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {alert.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No recent alerts</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* System Status */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/60">
          <CardHeader className="py-3 px-4 border-b border-slate-200/60">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl border backdrop-blur-sm ${systemStatus.apiOk ? "bg-emerald-50/70 border-emerald-200/60" : "bg-amber-50/70 border-amber-200/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {systemStatus.apiOk ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-amber-500" />}
                  <p className={`text-sm font-medium ${systemStatus.apiOk ? "text-emerald-600" : "text-amber-600"}`}>API Status</p>
                </div>
                <p className={`text-xl font-bold ${systemStatus.apiOk ? "text-emerald-700" : "text-amber-700"}`}>{systemStatus.api}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-sm ${systemStatus.dbOk ? "bg-blue-50/70 border-blue-200/60" : "bg-amber-50/70 border-amber-200/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Database className={`w-3.5 h-3.5 ${systemStatus.dbOk ? "text-blue-500" : "text-amber-500"}`} />
                  <p className={`text-sm font-medium ${systemStatus.dbOk ? "text-blue-600" : "text-amber-600"}`}>Database</p>
                </div>
                <p className={`text-xl font-bold ${systemStatus.dbOk ? "text-blue-700" : "text-amber-700"}`}>{systemStatus.database}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-sm ${systemStatus.alertsOk ? "bg-emerald-50/70 border-emerald-200/60" : "bg-red-50/70 border-red-200/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${systemStatus.alertsOk ? "text-emerald-500" : "text-red-500"}`} />
                  <p className={`text-sm font-medium ${systemStatus.alertsOk ? "text-emerald-600" : "text-red-600"}`}>Alerts</p>
                </div>
                <p className={`text-xl font-bold ${systemStatus.alertsOk ? "text-emerald-700" : "text-red-700"}`}>{systemStatus.alerts}</p>
              </div>
              <div className={`p-4 rounded-xl border backdrop-blur-sm ${systemStatus.coverageOk ? "bg-purple-50/70 border-purple-200/60" : "bg-red-50/70 border-red-200/60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className={`w-3.5 h-3.5 ${systemStatus.coverageOk ? "text-purple-500" : "text-red-500"}`} />
                  <p className={`text-sm font-medium ${systemStatus.coverageOk ? "text-purple-600" : "text-red-600"}`}>Coverage</p>
                </div>
                <p className={`text-xl font-bold ${systemStatus.coverageOk ? "text-purple-700" : "text-red-700"}`}>{systemStatus.coverage}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-200/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" className="justify-start" onClick={() => onNavigate("alerts")}>
                  <AlertTriangle className="w-3.5 h-3.5 mr-2 text-red-500" />
                  View Alerts
                </Button>
                {onBroadcast && (
                  <Button size="sm" variant="outline" className="justify-start" onClick={onBroadcast}>
                    <Radio className="w-3.5 h-3.5 mr-2 text-blue-500" />
                    Broadcast
                  </Button>
                )}
                <Button size="sm" variant="outline" className="justify-start" onClick={() => onNavigate("zones")}>
                  <MapPin className="w-3.5 h-3.5 mr-2 text-purple-500" />
                  Manage Zones
                </Button>
                <Button size="sm" variant="outline" className="justify-start" onClick={() => onNavigate("police")}>
                  <Shield className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                  Police Units
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
