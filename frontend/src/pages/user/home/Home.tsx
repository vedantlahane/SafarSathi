import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bell,
  Navigation,
  Loader2,
  WifiOff,
  Heart,
  PhoneCall,
  Compass,
  Zap,
  Users,
  Lightbulb,
  Siren,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useAppState, hapticFeedback, formatRelativeTime } from "@/lib/store";
import {
  connectAlertsSocket,
  fetchTouristDashboard,
  postLocation,
  type TouristAlert,
} from "@/lib/api";
import { useSession } from "@/lib/session";

// ─── Types ─────────────────────────────────────────────
interface AlertView {
  id: number;
  type: string;
  message: string;
  time: string;
  priority: "critical" | "high" | "medium" | "low";
}

interface SafetyFactor {
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
}

// ─── Constants ─────────────────────────────────────────
const EMERGENCY_CONTACTS = [
  { id: 1, name: "Police", number: "100", icon: Shield },
  { id: 2, name: "Ambulance", number: "108", icon: Heart },
  { id: 3, name: "Fire", number: "101", icon: Zap },
  { id: 4, name: "Women", number: "181", icon: Users },
  { id: 5, name: "Tourist", number: "1363", icon: Compass },
] as const;

const ALERT_CONFIG = {
  critical: { icon: Siren, className: "border-destructive/30 bg-destructive/5" },
  high: { icon: AlertTriangle, className: "border-destructive/20 bg-destructive/5" },
  medium: { icon: AlertTriangle, className: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950" },
  low: { icon: Bell, className: "border-border" },
} as const;

const SAFETY_TIPS = [
  "Always share your live location with family",
  "Keep emergency numbers saved offline",
  "Avoid isolated areas after dark",
  "Register with local tourist police",
  "Keep digital copies of documents",
] as const;

const REFRESH_INTERVAL = 30_000;

// ─── Component ─────────────────────────────────────────
export default function Home() {
  const session = useSession();
  const appState = useAppState();

  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [safetyScore, setSafetyScore] = useState(100);
  const [safetyFactors, setSafetyFactors] = useState<SafetyFactor[]>([]);
  const [status, setStatus] = useState("safe");
  const [loading, setLoading] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  const hasSession = Boolean(session?.touristId);
  const [tipIndex] = useState(() => Math.floor(Math.random() * SAFETY_TIPS.length));

  // ── Data Fetching ──
  const loadDashboard = useCallback(async () => {
    if (!session?.touristId) return;
    try {
      setLoading(true);
      const d = await fetchTouristDashboard(session.touristId);
      setSafetyScore(d.safetyScore ?? 100);
      setStatus(d.status ?? "safe");
      setOpenAlerts(d.openAlerts ?? 0);
      // setSafetyFactors(d.safetyFactors ?? []);
      setAlerts(
        d.alerts.map((a: TouristAlert) => ({
          id: a.id,
          type: a.alertType,
          message: a.message ?? "Alert received",
          time: formatRelativeTime(a.timestamp),
          priority: a.priority as AlertView["priority"],
        })),
      );
    } catch {
      // TODO: toast notification
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
    const id = setInterval(loadDashboard, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [hasSession, loadDashboard]);

  useEffect(() => {
    if (!hasSession) return;
    const socket = connectAlertsSocket((payload) => {
      hapticFeedback("medium");
      const p = payload as {
        id?: number;
        alertType?: string;
        message?: string;
        createdTime?: string;
      };
      setAlerts((prev) =>
        [
          {
            id: p.id ?? Date.now(),
            type: p.alertType ?? "ALERT",
            message: p.message ?? "Alert received",
            time: formatRelativeTime(p.createdTime ?? new Date().toISOString()),
            priority: "high" as const,
          },
          ...prev,
        ].slice(0, 20),
      );
    });
    return () => socket.close();
  }, [hasSession]);

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
          /* silent */
        } finally {
          setLocationLoading(false);
        }
      },
      () => setLocationLoading(false),
    );
  };

  return (
    <PullToRefresh
      onRefresh={async () => {
        hapticFeedback("light");
        await loadDashboard();
      }}
      className="flex-1 overflow-y-auto no-scrollbar"
    >
      <div className="flex flex-col gap-4 px-4 pt-2 pb-8">

        {/* ── Offline Banner ── */}
        {!appState.isOnline && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="flex items-center gap-3 p-3">
              <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
                You're offline. Some features may be limited.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-primary">
              {/* <AvatarImage src={session?.avatarUrl} alt="Profile" /> */}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {session?.name?.slice(0, 2).toUpperCase() ?? "GT"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back,</p>
              <h1 className="text-base font-bold leading-tight">
                {session?.name ?? "Guest"}
              </h1>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full"
          >
            <Bell className="h-5 w-5" />
            {openAlerts > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px]"
              >
                {openAlerts}
              </Badge>
            )}
          </Button>
        </header>

        {/* ── Safety Score Card (ML-Powered) ── */}
        <SafetyScoreCard
          score={safetyScore}
          status={status}
          factors={safetyFactors}
          hasSession={hasSession}
          loading={loading}
        />

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="default"
            className="h-14 gap-3 rounded-2xl active:scale-95 transition-transform"
            onClick={handleShareLocation}
            disabled={!hasSession || locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : locationShared ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Navigation className="h-5 w-5" />
            )}
            <span className="font-semibold">
              {locationShared ? "Shared!" : "Share Location"}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-14 gap-3 rounded-2xl active:scale-95 transition-transform"
            onClick={() => (window.location.hash = "#/map")}
          >
            <MapPin className="h-5 w-5" />
            <span className="font-semibold">View Map</span>
          </Button>
        </div>

        {/* ── Emergency Contacts ── */}
        <EmergencyContactsCard />

        {/* ── Alerts ── */}
        <AlertsSection alerts={alerts} loading={loading} hasSession={hasSession} />

        {/* ── Daily Tip (single, no carousel) ── */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Tip of the Day</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SAFETY_TIPS[tipIndex]}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PullToRefresh>
  );
}

// ─── Safety Score Card ─────────────────────────────────
function SafetyScoreCard({
  score,
  status,
  factors,
  hasSession,
  loading,
}: {
  score: number;
  status: string;
  factors: SafetyFactor[];
  hasSession: boolean;
  loading: boolean;
}) {
  const getScoreColor = () => {
    if (score >= 80) return "text-primary";
    if (score >= 50) return "text-orange-500";
    return "text-destructive";
  };

  const getProgressColor = () => {
    if (score >= 80) return "[&>div]:bg-primary";
    if (score >= 50) return "[&>div]:bg-orange-500";
    return "[&>div]:bg-destructive";
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Score Header */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  ML Safety Analysis
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold capitalize">{status}</h2>
                  <Badge
                    variant={
                      score >= 80 ? "secondary" : score >= 50 ? "default" : "destructive"
                    }
                    className="text-[10px] h-5"
                  >
                    {score >= 80 ? "Low Risk" : score >= 50 ? "Moderate" : "High Risk"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Score Circle */}
            <div className="relative h-16 w-16">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  className="stroke-muted" strokeWidth="4" fill="none"
                />
                <circle
                  cx="32" cy="32" r="28"
                  className={cn("transition-all duration-1000", getScoreColor().replace("text-", "stroke-"))}
                  strokeWidth="4" fill="none" strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 176} 176`}
                />
              </svg>
              <span className={cn("absolute inset-0 flex items-center justify-center text-lg font-bold", getScoreColor())}>
                {score}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <Progress value={score} className={cn("h-2", getProgressColor())} />
            <p className="text-[10px] text-muted-foreground">
              Based on real-time location, crowd density, time, and historical data
            </p>
          </div>
        </div>

        {/* Safety Factors Breakdown */}
        {factors.length > 0 && (
          <>
            <Separator />
            <div className="p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Contributing Factors
              </p>
              <div className="grid grid-cols-2 gap-2">
                {factors.slice(0, 4).map((factor) => {
                  const Icon = TrendIcon[factor.trend];
                  return (
                    <div
                      key={factor.label}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
                    >
                      <Icon
                        className={cn(
                          "h-3 w-3 shrink-0",
                          factor.trend === "up" && "text-primary",
                          factor.trend === "down" && "text-destructive",
                          factor.trend === "stable" && "text-muted-foreground",
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium truncate">
                          {factor.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {factor.score}/100
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Not signed in state */}
        {!hasSession && (
          <>
            <Separator />
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Sign in to get personalized safety analysis
              </p>
              <Button size="sm" className="mt-2">
                Get Started
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Emergency Contacts ────────────────────────────────
function EmergencyContactsCard() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardContent className="p-0">
          <CollapsibleTrigger asChild>
            <button
              className="flex w-full items-center justify-between p-4 active:bg-muted/50 transition-colors rounded-xl"
              onClick={() => hapticFeedback("light")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                  <PhoneCall className="h-5 w-5 text-destructive" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold">Emergency Contacts</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Quick dial important numbers
                  </p>
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  open && "rotate-90",
                )}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Separator />
            <div className="grid grid-cols-5 gap-3 p-4">
              {EMERGENCY_CONTACTS.map((contact) => {
                const Icon = contact.icon;
                return (
                  <a
                    key={contact.id}
                    href={`tel:${contact.number}`}
                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                    onClick={() => hapticFeedback("medium")}
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-11 w-11 rounded-xl"
                    >
                      <Icon className="h-5 w-5" />
                    </Button>
                    <span className="text-[9px] font-semibold text-center leading-tight">
                      {contact.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

// ─── Alerts Section ────────────────────────────────────
function AlertsSection({
  alerts,
  loading,
  hasSession,
}: {
  alerts: AlertView[];
  loading: boolean;
  hasSession: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Recent Alerts</h2>
        {alerts.length > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                View All
                <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[9px]">
                  {alerts.length}
                </Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" /> All Alerts
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 overflow-y-auto">
                {alerts.map((a) => (
                  <AlertCard key={a.id} alert={a} expanded />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {!hasSession ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Shield className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-bold">Sign in to Stay Safe</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Access alerts and real-time safety updates
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-bold">All Clear!</p>
            <p className="text-xs text-muted-foreground">No active alerts</p>
          </CardContent>
        </Card>
      ) : (
        alerts.slice(0, 3).map((a) => <AlertCard key={a.id} alert={a} />)
      )}
    </section>
  );
}

function AlertCard({ alert, expanded }: { alert: AlertView; expanded?: boolean }) {
  const config = ALERT_CONFIG[alert.priority] ?? ALERT_CONFIG.low;
  const Icon = config.icon;

  return (
    <Card className={cn("overflow-hidden", config.className)}>
      <CardContent className="flex gap-3 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold">{alert.type}</p>
              <Badge variant="secondary" className="text-[9px] h-4 mt-0.5">
                {alert.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground shrink-0">
              <Clock className="h-3 w-3" />
              <span className="text-[10px]">{alert.time}</span>
            </div>
          </div>
          <p className={cn("text-xs text-muted-foreground mt-1.5", !expanded && "line-clamp-2")}>
            {alert.message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}