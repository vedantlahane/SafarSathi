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
    onlineTourists: tourists.filter((t) => t.isActive).length,
    highRiskTourists: tourists.filter((t) => t.riskLevel === "high").length,
    activeZones: zones.filter((z) => z.isActive).length,
    criticalZones: zones.filter((z) => z.severity === "critical").length,
    activePolice: police.filter((p) => p.isActive).length,
  }), [alerts, tourists, zones, police]);

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
        title: `${alert.type} Alert`,
        description: alert.touristName || "Unknown tourist",
        timestamp: new Date(alert.timestamp),
        severity: alert.status === "ACTIVE" ? "critical" : "info",
      });
    });

    return activities.slice(0, 8);
  }, [recentAlerts]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard
          icon={AlertTriangle}
          label="Active Alerts"
          value={quickStats.activeAlerts}
          color="red"
          onClick={() => onNavigate("alerts")}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={quickStats.pendingAlerts}
          color="amber"
          onClick={() => onNavigate("alerts")}
        />
        <StatCard
          icon={Users}
          label="Online Tourists"
          value={quickStats.onlineTourists}
          color="blue"
          onClick={() => onNavigate("tourists")}
        />
        <StatCard
          icon={Activity}
          label="High Risk"
          value={quickStats.highRiskTourists}
          color="red"
          onClick={() => onNavigate("tourists")}
        />
        <StatCard
          icon={MapPin}
          label="Active Zones"
          value={quickStats.activeZones}
          color="purple"
          onClick={() => onNavigate("zones")}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Zones"
          value={quickStats.criticalZones}
          color="red"
          onClick={() => onNavigate("zones")}
        />
        <StatCard
          icon={Shield}
          label="Police Active"
          value={quickStats.activePolice}
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="py-3 px-4 border-b">
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
        <Card>
          <CardHeader className="py-3 px-4 border-b">
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
        <Card>
          <CardHeader className="py-3 px-4 border-b">
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
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
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
        <Card>
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-600 font-medium">API Status</p>
                <p className="text-2xl font-bold text-emerald-700">Online</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">WebSocket</p>
                <p className="text-2xl font-bold text-blue-700">Connected</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Database</p>
                <p className="text-2xl font-bold text-purple-700">Healthy</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-600 font-medium">Last Sync</p>
                <p className="text-lg font-bold text-amber-700">Just now</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
