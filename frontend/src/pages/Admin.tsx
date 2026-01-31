import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  adminLogin,
  createAdminRiskZone,
  createPoliceDepartment,
  deleteAdminRiskZone,
  deletePoliceDepartment,
  fetchAdminAlerts,
  fetchAdminDashboard,
  fetchAdminRiskZones,
  fetchAdminTourists,
  fetchPoliceDepartments,
  resolveAlert,
  toggleAdminRiskZone,
  updateAdminRiskZone,
  updatePoliceDepartment,
  verifyDigitalId
} from "@/lib/api";
import { saveAdminSession, useAdminSession } from "@/lib/session";

type AdminProps = {
  activeSection: string;
};

const Admin = ({ activeSection }: AdminProps) => {
  const adminSession = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof fetchAdminDashboard>> | null>(null);
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof fetchAdminAlerts>>>([]);
  const [tourists, setTourists] = useState<Awaited<ReturnType<typeof fetchAdminTourists>>>([]);
  const [riskZones, setRiskZones] = useState<Awaited<ReturnType<typeof fetchAdminRiskZones>>>([]);
  const [policeUnits, setPoliceUnits] = useState<Awaited<ReturnType<typeof fetchPoliceDepartments>>>([]);
  const [verifyHash, setVerifyHash] = useState("");
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneLat, setNewZoneLat] = useState("");
  const [newZoneLng, setNewZoneLng] = useState("");
  const [newZoneRadius, setNewZoneRadius] = useState("");
  const [newZoneLevel, setNewZoneLevel] = useState("HIGH");

  const [newPoliceName, setNewPoliceName] = useState("");
  const [newPoliceEmail, setNewPoliceEmail] = useState("");
  const [newPolicePassword, setNewPolicePassword] = useState("");
  const [newPoliceCode, setNewPoliceCode] = useState("");
  const [newPoliceCity, setNewPoliceCity] = useState("");
  const [newPoliceDistrict, setNewPoliceDistrict] = useState("");
  const [newPoliceState, setNewPoliceState] = useState("");
  const [newPoliceContact, setNewPoliceContact] = useState("");
  const [newPoliceLat, setNewPoliceLat] = useState("");
  const [newPoliceLng, setNewPoliceLng] = useState("");

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
      setRiskZones([]);
      setPoliceUnits([]);
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
        const [zones, police] = await Promise.all([
          fetchAdminRiskZones(),
          fetchPoliceDepartments()
        ]);
        if (!active) {
          return;
        }
        setDashboard(dashboardState);
        setAlerts(alertHistory);
        setTourists(touristsList);
        setRiskZones(zones);
        setPoliceUnits(police);
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

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    setVerifyResult(null);
    try {
      const result = await verifyDigitalId(verifyHash);
      setVerifyResult(`${result.name} • ${result.blockchain_status}`);
    } catch (err) {
      setVerifyResult((err as Error).message || "Verification failed.");
    }
  };

  const handleCreateZone = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await createAdminRiskZone({
        name: newZoneName,
        description: "",
        centerLat: Number(newZoneLat),
        centerLng: Number(newZoneLng),
        radiusMeters: Number(newZoneRadius),
        riskLevel: newZoneLevel,
        active: true
      });
      setRiskZones((prev) => [created, ...prev]);
      setNewZoneName("");
      setNewZoneLat("");
      setNewZoneLng("");
      setNewZoneRadius("");
    } catch (err) {
      setError((err as Error).message || "Unable to create zone.");
    }
  };

  const handleToggleZone = async (id: number, active: boolean) => {
    try {
      const updated = await toggleAdminRiskZone(id, active);
      setRiskZones((prev) => prev.map((zone) => (zone.id === id ? updated : zone)));
    } catch (err) {
      setError((err as Error).message || "Unable to update zone.");
    }
  };

  const handleDeleteZone = async (id: number) => {
    try {
      await deleteAdminRiskZone(id);
      setRiskZones((prev) => prev.filter((zone) => zone.id !== id));
    } catch (err) {
      setError((err as Error).message || "Unable to delete zone.");
    }
  };

  const handleCycleRiskLevel = async (zoneId: number, current: string) => {
    const next = current === "HIGH" ? "MEDIUM" : current === "MEDIUM" ? "LOW" : "HIGH";
    try {
      const updated = await updateAdminRiskZone(zoneId, { riskLevel: next });
      setRiskZones((prev) => prev.map((zone) => (zone.id === zoneId ? updated : zone)));
    } catch (err) {
      setError((err as Error).message || "Unable to update risk level.");
    }
  };

  const handleCreatePolice = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await createPoliceDepartment({
        name: newPoliceName,
        email: newPoliceEmail,
        passwordHash: newPolicePassword,
        departmentCode: newPoliceCode,
        latitude: Number(newPoliceLat),
        longitude: Number(newPoliceLng),
        city: newPoliceCity,
        district: newPoliceDistrict,
        state: newPoliceState,
        contactNumber: newPoliceContact,
        isActive: true
      });
      setPoliceUnits((prev) => [created, ...prev]);
      setNewPoliceName("");
      setNewPoliceEmail("");
      setNewPolicePassword("");
      setNewPoliceCode("");
      setNewPoliceCity("");
      setNewPoliceDistrict("");
      setNewPoliceState("");
      setNewPoliceContact("");
      setNewPoliceLat("");
      setNewPoliceLng("");
    } catch (err) {
      setError((err as Error).message || "Unable to create police unit.");
    }
  };

  const handleTogglePolice = async (id: string, current: boolean | undefined) => {
    try {
      const updated = await updatePoliceDepartment(id, { isActive: !current });
      setPoliceUnits((prev) => prev.map((unit) => (unit.id === id ? updated : unit)));
    } catch (err) {
      setError((err as Error).message || "Unable to update police unit.");
    }
  };

  const handleDeletePolice = async (id: string) => {
    try {
      await deletePoliceDepartment(id);
      setPoliceUnits((prev) => prev.filter((unit) => unit.id !== id));
    } catch (err) {
      setError((err as Error).message || "Unable to delete police unit.");
    }
  };

  const activeAlerts = useMemo(() => alerts.filter((alert) => alert.status !== "RESOLVED"), [alerts]);
  const sosAlerts = useMemo(() => alerts.filter((alert) => alert.alertType === "SOS"), [alerts]);

  if (!adminSession) {
    return (
      <Card className="max-w-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Admin Sign In</CardTitle>
          <CardDescription className="text-[12px]">Use control center credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-[12px] text-muted-foreground">
          <form className="space-y-2" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="text-[11px]">Admin email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                placeholder="admin@safarsathi.in"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px]">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                placeholder="••••••••"
              />
            </div>
            <Button size="sm" className="text-[12px]" type="submit" disabled={loading}>
              Sign in
            </Button>
          </form>
          {success && <div className="text-emerald-600">{success}</div>}
          {error && <div className="text-destructive">{error}</div>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div>}

      {activeSection === "dashboard" && dashboard && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Critical Alerts</div>
                <div className="text-2xl font-semibold text-slate-900">{dashboard.stats.criticalAlerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Active Alerts</div>
                <div className="text-2xl font-semibold text-slate-900">{dashboard.stats.activeAlerts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Monitored Tourists</div>
                <div className="text-2xl font-semibold text-slate-900">{dashboard.stats.monitoredTourists}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-xs text-slate-500">Total Tourists</div>
                <div className="text-2xl font-semibold text-slate-900">{dashboard.stats.totalTourists}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Alerts</CardTitle>
                <CardDescription className="text-[12px]">Live SOS and high priority incidents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between gap-2 rounded-md border border-border/60 bg-white p-3">
                    <div className="space-y-1">
                      <div className="text-[12px] font-semibold text-slate-900">{alert.alertType}</div>
                      <div className="text-[11px] text-slate-500">{alert.message ?? "Alert"}</div>
                      <div className="text-[10px] text-slate-400">{new Date(alert.createdTime).toLocaleString()}</div>
                    </div>
                    <Button size="sm" variant="secondary" className="text-[11px]" onClick={() => handleResolve(alert.id, "RESOLVED")}>Resolve</Button>
                  </div>
                ))}
                {activeAlerts.length === 0 && <div className="text-[12px] text-slate-500">No active alerts.</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Verify Digital ID</CardTitle>
                <CardDescription className="text-[12px]">Paste hash to validate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <form className="space-y-2" onSubmit={handleVerify}>
                  <input
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                    placeholder="Hash from QR"
                  />
                  <Button size="sm" className="text-[12px]" type="submit">Verify</Button>
                </form>
                {verifyResult && <div className="text-[12px] text-slate-600">{verifyResult}</div>}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeSection === "alerts" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alert History</CardTitle>
            <CardDescription className="text-[12px]">Resolve alerts once handled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between gap-2 rounded-md border border-border/60 bg-white p-3">
                <div className="space-y-1">
                  <div className="text-[12px] font-semibold text-slate-900">{alert.alertType}</div>
                  <div className="text-[11px] text-slate-500">{alert.message ?? "Alert"}</div>
                  <div className="text-[10px] text-slate-400">{new Date(alert.createdTime).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">{alert.status}</Badge>
                  <Button size="sm" variant="secondary" className="text-[11px]" onClick={() => handleResolve(alert.id, "RESOLVED")}>Resolve</Button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-[12px] text-slate-500">No alerts.</div>}
          </CardContent>
        </Card>
      )}

      {activeSection === "tourists" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tourists</CardTitle>
            <CardDescription className="text-[12px]">Latest registered tourists and safety scores.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {tourists.map((tourist) => (
              <div key={tourist.id} className="flex items-center justify-between rounded-md border border-border/60 bg-white p-3">
                <div>
                  <div className="text-[12px] font-semibold text-slate-900">{tourist.name}</div>
                  <div className="text-[11px] text-slate-500">{tourist.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-semibold">{tourist.safetyScore ?? 100}</div>
                  <div className="text-[10px] text-slate-400">{tourist.status ?? "active"}</div>
                </div>
              </div>
            ))}
            {tourists.length === 0 && <div className="text-[12px] text-slate-500">No tourists.</div>}
          </CardContent>
        </Card>
      )}

      {activeSection === "risk-zones" && (
        <div className="grid grid-cols-[1.2fr_1fr] gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Risk Zones</CardTitle>
              <CardDescription className="text-[12px]">Activate or remove unsafe zones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {riskZones.map((zone) => (
                <div key={zone.id} className="flex items-center justify-between rounded-md border border-border/60 bg-white p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-slate-900">{zone.name}</div>
                    <div className="text-[11px] text-slate-500">{zone.riskLevel} • {zone.radiusMeters} m</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="text-[11px]" onClick={() => handleToggleZone(zone.id, !zone.active)}>
                      {zone.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" className="text-[11px]" onClick={() => handleCycleRiskLevel(zone.id, zone.riskLevel)}>
                      Cycle Level
                    </Button>
                    <Button size="sm" variant="outline" className="text-[11px]" onClick={() => handleDeleteZone(zone.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {riskZones.length === 0 && <div className="text-[12px] text-slate-500">No zones.</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Create Zone</CardTitle>
              <CardDescription className="text-[12px]">Define new risk areas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form className="space-y-2" onSubmit={handleCreateZone}>
                <input value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Zone name" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={newZoneLat} onChange={(e) => setNewZoneLat(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Latitude" />
                  <input value={newZoneLng} onChange={(e) => setNewZoneLng(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Longitude" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={newZoneRadius} onChange={(e) => setNewZoneRadius(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Radius (m)" />
                  <select value={newZoneLevel} onChange={(e) => setNewZoneLevel(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]">
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <Button size="sm" className="text-[12px]" type="submit">Create zone</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "police" && (
        <div className="grid grid-cols-[1.2fr_1fr] gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Police Units</CardTitle>
              <CardDescription className="text-[12px]">Activate and manage field units.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {policeUnits.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between rounded-md border border-border/60 bg-white p-3">
                  <div>
                    <div className="text-[12px] font-semibold text-slate-900">{unit.name}</div>
                    <div className="text-[11px] text-slate-500">{unit.city} • {unit.contactNumber}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" className="text-[11px]" onClick={() => handleTogglePolice(unit.id, unit.isActive)}>
                      {unit.isActive ? "Set Offline" : "Set Active"}
                    </Button>
                    <Button size="sm" variant="outline" className="text-[11px]" onClick={() => handleDeletePolice(unit.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {policeUnits.length === 0 && <div className="text-[12px] text-slate-500">No police units.</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Police Unit</CardTitle>
              <CardDescription className="text-[12px]">Create new station entry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <form className="space-y-2" onSubmit={handleCreatePolice}>
                <input value={newPoliceName} onChange={(e) => setNewPoliceName(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Station name" />
                <input value={newPoliceEmail} onChange={(e) => setNewPoliceEmail(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Email" />
                <input value={newPolicePassword} onChange={(e) => setNewPolicePassword(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Password" />
                <input value={newPoliceCode} onChange={(e) => setNewPoliceCode(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Dept code" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={newPoliceCity} onChange={(e) => setNewPoliceCity(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="City" />
                  <input value={newPoliceDistrict} onChange={(e) => setNewPoliceDistrict(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="District" />
                </div>
                <input value={newPoliceState} onChange={(e) => setNewPoliceState(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="State" />
                <input value={newPoliceContact} onChange={(e) => setNewPoliceContact(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Contact number" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={newPoliceLat} onChange={(e) => setNewPoliceLat(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Latitude" />
                  <input value={newPoliceLng} onChange={(e) => setNewPoliceLng(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]" placeholder="Longitude" />
                </div>
                <Button size="sm" className="text-[12px]" type="submit">Create unit</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "alerts" && sosAlerts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">SOS Feed</CardTitle>
            <CardDescription className="text-[12px]">Immediate SOS notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sosAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3">
                <div>
                  <div className="text-[12px] font-semibold text-red-700">SOS</div>
                  <div className="text-[11px] text-red-500">{alert.message ?? "Emergency alert"}</div>
                </div>
                <Button size="sm" variant="secondary" className="text-[11px]" onClick={() => handleResolve(alert.id, "RESOLVED")}>Resolve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Admin;

