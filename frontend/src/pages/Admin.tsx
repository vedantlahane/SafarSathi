import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  adminLogin,
  fetchAdminAlerts,
  fetchAdminDashboard,
  fetchAdminTourists,
  resolveAlert
} from "@/lib/api";
import { clearAdminSession, saveAdminSession, useAdminSession } from "@/lib/session";

const Admin = () => {
  const adminSession = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof fetchAdminDashboard>> | null>(null);
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof fetchAdminAlerts>>>([]);
  const [tourists, setTourists] = useState<Awaited<ReturnType<typeof fetchAdminTourists>>>([]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await adminLogin({ email, password });
      saveAdminSession({
        adminId: result.admin.id,
        token: result.token,
        name: result.admin.name,
        email: result.admin.email,
        departmentCode: result.admin.departmentCode,
        city: result.admin.city,
        district: result.admin.district,
        state: result.admin.state
      });
      setSuccess("Admin signed in.");
    } catch (err) {
      setError((err as Error).message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminSession) {
      setDashboard(null);
      setAlerts([]);
      setTourists([]);
      return;
    }

    let active = true;
    const loadAdmin = async () => {
      try {
        setLoading(true);
        const [dashboardState, alertHistory, touristsList] = await Promise.all([
          fetchAdminDashboard(),
          fetchAdminAlerts(),
          fetchAdminTourists()
        ]);
        if (!active) {
          return;
        }
        setDashboard(dashboardState);
        setAlerts(alertHistory);
        setTourists(touristsList);
        setError(null);
      } catch (err) {
        if (!active) {
          return;
        }
        setError((err as Error).message || "Unable to load admin dashboard.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAdmin();
    const interval = window.setInterval(loadAdmin, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [adminSession]);

  const handleResolve = async (alertId: number, status: string) => {
    try {
      await resolveAlert(alertId, status);
      setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, status } : alert)));
    } catch (err) {
      setError((err as Error).message || "Unable to update alert.");
    }
  };

  return (
    <div className="space-y-3 text-[13px]">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Admin Console</CardTitle>
          <CardDescription className="text-[12px]">Monitor alerts, SOS, and tourist safety.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-[12px] text-muted-foreground">
          {!adminSession && (
            <form className="space-y-2" onSubmit={handleLogin}>
              <div className="space-y-1">
                <label className="text-[11px]">Admin email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                  placeholder="admin@safarsathi.in"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px]">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                  placeholder="••••••••"
                />
              </div>
              <Button size="sm" className="text-[12px]" type="submit" disabled={loading}>
                Sign in
              </Button>
            </form>
          )}

          {adminSession && (
            <div className="space-y-2">
              <div>
                Signed in as <span className="font-semibold text-foreground">{adminSession.name}</span>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="text-[12px]"
                onClick={() => clearAdminSession()}
              >
                Sign out
              </Button>
            </div>
          )}

          {success && <div className="text-emerald-600">{success}</div>}
          {error && <div className="text-destructive">{error}</div>}
        </CardContent>
      </Card>

      {adminSession && dashboard && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Card>
              <CardContent className="p-3">
                <div className="text-[11px] text-muted-foreground">Critical Alerts</div>
                <div className="text-xl font-semibold">{dashboard.stats.criticalAlerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-[11px] text-muted-foreground">Active Alerts</div>
                <div className="text-xl font-semibold">{dashboard.stats.activeAlerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-[11px] text-muted-foreground">Monitored Tourists</div>
                <div className="text-xl font-semibold">{dashboard.stats.monitoredTourists}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-[11px] text-muted-foreground">Total Tourists</div>
                <div className="text-xl font-semibold">{dashboard.stats.totalTourists}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Alert History</CardTitle>
              <CardDescription className="text-[12px]">Resolve alerts once handled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length === 0 && <div className="text-[12px] text-muted-foreground">No alerts.</div>}
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between gap-2 rounded-md border border-border/60 p-2">
                  <div className="space-y-1">
                    <div className="text-[12px] font-semibold text-foreground">{alert.alertType}</div>
                    <div className="text-[11px] text-muted-foreground">{alert.message ?? "Alert"}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(alert.createdTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary">{alert.status}</Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-[11px]"
                      onClick={() => handleResolve(alert.id, "RESOLVED")}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tourists</CardTitle>
              <CardDescription className="text-[12px]">Latest registered tourists and safety scores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {tourists.length === 0 && <div className="text-[12px] text-muted-foreground">No tourists.</div>}
              {tourists.map((tourist) => (
                <div key={tourist.id} className="flex items-center justify-between rounded-md border border-border/60 p-2">
                  <div>
                    <div className="text-[12px] font-semibold text-foreground">{tourist.name}</div>
                    <div className="text-[11px] text-muted-foreground">{tourist.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-semibold">{tourist.safetyScore ?? 100}</div>
                    <div className="text-[10px] text-muted-foreground">{tourist.status ?? "active"}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Admin;
