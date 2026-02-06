import { useEffect, useState, useCallback } from "react";
import {
  Siren,
  QrCode,
  Bell,
  Shield,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Loader2,
  Navigation,
  Wifi,
  WifiOff,
  Heart,
  Info,
  PhoneCall,
  Compass,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useAppState, hapticFeedback, formatRelativeTime } from "@/lib/store";
import {
  connectAlertsSocket,
  fetchTouristDashboard,
  postSOS,
  postLocation,
  type TouristAlert,
} from "@/lib/api";
import { useSession } from "@/lib/session";

interface AlertView {
  id: number;
  type: string;
  message: string;
  time: string;
  priority: string;
}

// Emergency contacts
const EMERGENCY_CONTACTS = [
  { id: 1, name: "Police", number: "100", icon: Shield, color: "bg-blue-500" },
  { id: 2, name: "Ambulance", number: "108", icon: Heart, color: "bg-red-500" },
  { id: 3, name: "Fire", number: "101", icon: Zap, color: "bg-orange-500" },
  { id: 4, name: "Women", number: "181", icon: Users, color: "bg-pink-500" },
  { id: 5, name: "Tourist", number: "1363", icon: Compass, color: "bg-emerald-500" },
];

// Quick tips
const SAFETY_TIPS = [
  "Always share your live location with family",
  "Keep emergency numbers saved offline",
  "Avoid isolated areas after dark",
  "Register with local tourist police",
  "Keep digital copies of documents",
];

export default function Main() {
  const session = useSession();
  const appState = useAppState();
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [safetyScore, setSafetyScore] = useState<number>(100);
  const [status, setStatus] = useState<string>("safe");
  const [loading, setLoading] = useState(false);
  const [openAlerts, setOpenAlerts] = useState<number>(0);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  const hasSession = Boolean(session?.touristId);

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((i) => (i + 1) % SAFETY_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock weather (in real app, fetch from API)
  useEffect(() => {
    setWeather({ temp: 28, condition: "sunny" });
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!session?.touristId) return;
    try {
      setLoading(true);
      const dashboard = await fetchTouristDashboard(session.touristId);
      setSafetyScore(dashboard.safetyScore ?? 100);
      setStatus(dashboard.status ?? "safe");
      setOpenAlerts(dashboard.openAlerts ?? 0);
      setAlerts(
        dashboard.alerts.map((a: TouristAlert) => ({
          id: a.id,
          type: a.alertType,
          message: a.message ?? "Alert received",
          time: formatRelativeTime(a.timestamp),
          priority: a.priority,
        }))
      );
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [session?.touristId]);

  useEffect(() => {
    if (!hasSession) {
      setAlerts([]);
      setSafetyScore(100);
      setStatus("safe");
      return;
    }
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [hasSession, loadDashboard]);

  useEffect(() => {
    if (!hasSession) return;
    const socket = connectAlertsSocket((payload) => {
      hapticFeedback("medium");
      const incoming = payload as { id: number; alertType?: string; message?: string; createdTime?: string };
      setAlerts((prev) =>
        [
          {
            id: incoming.id ?? Date.now(),
            type: incoming.alertType ?? "ALERT",
            message: incoming.message ?? "Alert received",
            time: formatRelativeTime(incoming.createdTime ?? new Date().toISOString()),
            priority: "high",
          },
          ...prev,
        ].slice(0, 20)
      );
    });
    return () => socket.close();
  }, [hasSession]);

  const handleSOS = async () => {
    if (!session?.touristId) return;
    hapticFeedback("heavy");
    setSosLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await postSOS(session.touristId, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setSosSuccess(true);
            hapticFeedback("heavy");
            setSosLoading(false);
          },
          async () => {
            await postSOS(session.touristId, {});
            setSosSuccess(true);
            setSosLoading(false);
          }
        );
      } else {
        await postSOS(session.touristId, {});
        setSosSuccess(true);
        setSosLoading(false);
      }
    } catch {
      setSosLoading(false);
    }
  };

  const handleShareLocation = async () => {
    if (!session?.touristId || !navigator.geolocation) return;
    hapticFeedback("light");
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await postLocation(session.touristId, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setLocationShared(true);
          setTimeout(() => setLocationShared(false), 2000);
        } catch {
          // Silent fail
        } finally {
          setLocationLoading(false);
        }
      },
      () => setLocationLoading(false)
    );
  };

  const handleRefresh = async () => {
    hapticFeedback("light");
    await loadDashboard();
  };

  const getStatusGradient = () => {
    switch (status.toLowerCase()) {
      case "danger":
      case "emergency":
        return "from-red-500 via-red-600 to-red-700";
      case "warning":
        return "from-amber-400 via-amber-500 to-amber-600";
      default:
        return "from-emerald-400 via-emerald-500 to-emerald-600";
    }
  };

  const getWeatherIcon = () => {
    switch (weather?.condition) {
      case "rainy":
        return CloudRain;
      case "cloudy":
        return Cloud;
      default:
        return Sun;
    }
  };
  const WeatherIcon = getWeatherIcon();

  return (
    <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-4 p-4 pb-8">
        {/* Connection Status Banner */}
        {!appState.isOnline && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 animate-in slide-in-from-top">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-800">
              You're offline. Some features may be limited.
            </span>
          </div>
        )}

        {/* Hero Safety Card */}
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className={cn("bg-gradient-to-br p-5 text-white", getStatusGradient())}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-90">Safety Status</span>
                </div>
                <h2 className="text-2xl font-bold capitalize">{status}</h2>
                {hasSession && (
                  <p className="text-xs opacity-80">
                    {openAlerts} active alert{openAlerts !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="relative inline-flex">
                  <svg className="h-20 w-20 -rotate-90 transform">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(safetyScore / 100) * 220} 220`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                    {safetyScore}
                  </span>
                </div>
                <p className="text-[10px] opacity-80 -mt-1">Safety Score</p>
              </div>
            </div>
          </div>

          {/* Weather & Tips Bar */}
          <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
                <WeatherIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xs">
                <span className="font-medium">{weather?.temp}°C</span>
                <span className="text-muted-foreground ml-1 capitalize">{weather?.condition}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span className="max-w-[160px] truncate">{SAFETY_TIPS[currentTipIndex]}</span>
            </div>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* SOS Button - Large and prominent */}
          <Button
            variant="destructive"
            className={cn(
              "relative h-28 flex-col gap-2 rounded-2xl text-white shadow-xl touch-action overflow-hidden",
              "bg-gradient-to-br from-red-500 via-red-600 to-red-700",
              "hover:from-red-600 hover:via-red-700 hover:to-red-800",
              "active:scale-[0.98] transition-transform"
            )}
            onClick={() => hasSession && setSosDialogOpen(true)}
            disabled={!hasSession}
          >
            {/* Pulse animation background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/10 animate-ping" />
            </div>
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Siren className="h-6 w-6" />
            </div>
            <span className="relative z-10 text-sm font-bold tracking-wide">EMERGENCY SOS</span>
          </Button>

          {/* Share Location */}
          <Button
            variant="default"
            className={cn(
              "h-28 flex-col gap-2 rounded-2xl shadow-lg touch-action",
              "bg-gradient-to-br from-blue-500 to-blue-600",
              "hover:from-blue-600 hover:to-blue-700",
              "active:scale-[0.98] transition-transform"
            )}
            onClick={handleShareLocation}
            disabled={!hasSession || locationLoading}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              {locationLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : locationShared ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Navigation className="h-6 w-6" />
              )}
            </div>
            <span className="text-sm font-bold">
              {locationShared ? "Location Shared!" : "Share Location"}
            </span>
          </Button>
        </div>

        {/* Emergency Contacts Section */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <button
              className="flex w-full items-center justify-between p-4 touch-action"
              onClick={() => {
                hapticFeedback("light");
                setShowEmergencyContacts(!showEmergencyContacts);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <PhoneCall className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold">Emergency Contacts</h3>
                  <p className="text-xs text-muted-foreground">Quick dial important numbers</p>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  showEmergencyContacts && "rotate-90"
                )}
              />
            </button>

            {showEmergencyContacts && (
              <div className="grid grid-cols-5 gap-2 px-4 pb-4 animate-in slide-in-from-top duration-200">
                {EMERGENCY_CONTACTS.map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <a
                      key={contact.id}
                      href={`tel:${contact.number}`}
                      className="flex flex-col items-center gap-1.5 touch-action"
                      onClick={() => hapticFeedback("medium")}
                    >
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl text-white",
                          contact.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight">
                        {contact.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Alerts</h2>
            {alerts.length > 0 && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                    View All
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                      {alerts.length}
                    </Badge>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      All Alerts
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-3 overflow-y-auto pr-2">
                    {alerts.map((alert) => (
                      <AlertCard key={alert.id} alert={alert} expanded />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {!hasSession ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
                  <Shield className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="font-semibold">Sign in to Stay Safe</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-[220px]">
                  Access alerts, emergency features, and real-time safety updates
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : alerts.length === 0 ? (
            <Card className="border-dashed border-2 border-emerald-200 bg-emerald-50/50">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-800">All Clear!</p>
                <p className="text-xs text-emerald-600">No active alerts in your area</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-3 gap-3">
          <QuickInfoCard
            icon={QrCode}
            label="Digital ID"
            value={hasSession ? "Active" : "—"}
            color="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <QuickInfoCard
            icon={Wifi}
            label="Connection"
            value={appState.isOnline ? "Online" : "Offline"}
            color={appState.isOnline ? "bg-emerald-50" : "bg-red-50"}
            iconColor={appState.isOnline ? "text-emerald-600" : "text-red-600"}
          />
          <QuickInfoCard
            icon={Phone}
            label="Emergency"
            value="112"
            color="bg-red-50"
            iconColor="text-red-600"
            href="tel:112"
          />
        </div>

        {/* Safety Tip Card */}
        <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900">Safety Tip</h3>
                <p className="text-xs text-blue-700 mt-1">{SAFETY_TIPS[currentTipIndex]}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-3">
              {SAFETY_TIPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i === currentTipIndex ? "bg-blue-500" : "bg-blue-200"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SOS Confirmation Dialog */}
      <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
        <DialogContent className="rounded-3xl max-w-[90vw] p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-6 text-white text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mx-auto mb-3">
              <Siren className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">Send Emergency SOS?</DialogTitle>
            <DialogDescription className="text-red-100 mt-2">
              This will immediately alert nearby authorities and share your exact location
            </DialogDescription>
          </div>

          <div className="p-6">
            {sosSuccess ? (
              <div className="flex flex-col items-center py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="font-bold text-lg">SOS Sent Successfully</p>
                <p className="text-sm text-muted-foreground">Help is on the way</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    setSosDialogOpen(false);
                    setSosSuccess(false);
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Make sure you are in a genuine emergency before sending SOS.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSosDialogOpen(false)}
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleSOS}
                    disabled={sosLoading}
                    className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600"
                  >
                    {sosLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Siren className="mr-2 h-5 w-5" />
                        Send SOS
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PullToRefresh>
  );
}

function AlertCard({ alert, expanded }: { alert: AlertView; expanded?: boolean }) {
  const getAlertStyle = () => {
    switch (alert.priority?.toLowerCase()) {
      case "critical":
        return { icon: Siren, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      case "high":
        return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      case "medium":
        return { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      default:
        return { icon: Bell, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
    }
  };

  const style = getAlertStyle();
  const Icon = style.icon;

  return (
    <Card className={cn("overflow-hidden border", style.border)}>
      <CardContent className="p-3">
        <div className="flex gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", style.bg)}>
            <Icon className={cn("h-5 w-5", style.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={cn("text-sm font-semibold", style.color)}>{alert.type}</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    "mt-1 text-[10px] h-5",
                    alert.priority?.toLowerCase() === "critical" && "bg-red-100 text-red-700",
                    alert.priority?.toLowerCase() === "high" && "bg-red-100 text-red-700",
                    alert.priority?.toLowerCase() === "medium" && "bg-amber-100 text-amber-700"
                  )}
                >
                  {alert.priority || "low"} priority
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                <span className="text-[10px]">{alert.time}</span>
              </div>
            </div>
            <p className={cn("text-xs text-muted-foreground mt-2", !expanded && "line-clamp-2")}>
              {alert.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickInfoCard({
  icon: Icon,
  label,
  value,
  color,
  iconColor,
  href,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  color: string;
  iconColor: string;
  href?: string;
}) {
  const content = (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-3 flex flex-col items-center text-center">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-2", color)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="touch-action block" onClick={() => hapticFeedback("medium")}>
        {content}
      </a>
    );
  }

  return content;
}
