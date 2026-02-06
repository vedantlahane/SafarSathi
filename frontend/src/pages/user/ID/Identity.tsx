import { useEffect, useState, useRef } from "react";
import {
  QrCode,
  Shield,
  User,
  FileText,
  Calendar,
  Globe,
  Copy,
  CheckCircle2,
  Share2,
  CreditCard,
  Fingerprint,
  Phone,
  Mail,
  Verified,
  Link,
  Clock,
  Download,
  ChevronRight,
  Star,
  Zap,
  MapPin,
  Activity,
  Lock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import { fetchTouristProfile, getApiBaseUrl, type TouristProfile } from "@/lib/api";
import { useSession } from "@/lib/session";

const Identity = () => {
  const session = useSession();
  const [profile, setProfile] = useState<TouristProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!session?.touristId) {
      setProfile(null);
      return;
    }
    let active = true;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchTouristProfile(session.touristId);
        if (active) setProfile(data);
      } catch {
        // Silent fail
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, [session?.touristId]);

  const verificationUrl = profile?.idHash
    ? `${getApiBaseUrl()}/api/admin/id/verify?hash=${profile.idHash}`
    : null;

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    hapticFeedback("light");
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    if (!profile || !navigator.share) return;
    hapticFeedback("light");
    try {
      await navigator.share({
        title: "SafarSathi Tourist ID",
        text: `Tourist ID: ${profile.id}\nName: ${profile.name}\nVerified by SafarSathi`,
        url: verificationUrl || undefined,
      });
    } catch {
      // User cancelled
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50" };
    if (score >= 50) return { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-50" };
    return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-50" };
  };

  // Not logged in
  if (!session?.touristId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-40 right-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        <div className="relative mb-8">
          {/* Animated rings */}
          <div className="absolute inset-0 animate-ping rounded-3xl bg-primary/20" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-2 animate-ping rounded-2xl bg-primary/10" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
          
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl shadow-blue-500/25">
            <CreditCard className="h-14 w-14 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg border">
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Digital Identity</h1>
        <p className="text-muted-foreground max-w-75 leading-relaxed">
          Sign in to access your blockchain-verified tourist safety card
        </p>

        <div className="mt-8 flex flex-col gap-3 w-full max-w-70">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Verified Identity</p>
              <p className="text-xs text-muted-foreground">Blockchain secured</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <QrCode className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Instant Verification</p>
              <p className="text-xs text-muted-foreground">Scan QR to verify</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Works Offline</p>
              <p className="text-xs text-muted-foreground">Access anytime</p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Go to Settings to sign in or create account
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const safetyScore = profile?.safetyScore ?? 100;
  const safetyColor = getSafetyColor(safetyScore);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Connection Status */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors",
          isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
        )}
      >
        {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        {isOnline ? "Connected • ID Verified" : "Offline Mode • ID Available"}
      </div>

      {/* Premium ID Card */}
      <div ref={cardRef} className="relative">
        <Card className="overflow-hidden border-0 shadow-2xl rounded-3xl">
          {/* Card Front */}
          <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white min-h-70">
            {/* Holographic Effect */}
            <div className="absolute inset-0 bg-linrear-to-tr from-blue-500/20 via-transparent to-purple-500/20 opacity-50" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
            </div>

            {/* Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%">
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                      SafarSathi
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-wide">TOURIST SAFETY PASS</h2>
                </div>
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setShowQR(true);
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <QrCode className="h-7 w-7" />
                </button>
              </div>

              {/* Chip */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-14 rounded-lg bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 p-0.5">
                  <div className="h-full w-full rounded-md bg-linear-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-0.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-1.5 w-2 bg-amber-600/40 rounded-sm" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-300 font-medium">ACTIVE</span>
                </div>
              </div>

              {/* Name & ID */}
              <div className="space-y-1 mb-6">
                <p className="text-2xl font-bold tracking-wide">
                  {profile?.name?.toUpperCase() || session.name?.toUpperCase()}
                </p>
                <p className="text-sm text-slate-400 font-mono tracking-wider">
                  ID: {profile?.id?.slice(0, 8)}...{profile?.id?.slice(-4)}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Verified className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-300">Blockchain</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Safety</p>
                    <p className={cn("text-lg font-bold", safetyColor.text)}>{safetyScore}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Valid Thru</p>
                  <p className="text-sm font-medium text-slate-300">
                    {profile?.idExpiry || "12/26"}
                  </p>
                </div>
              </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <QuickAction
          icon={Copy}
          label="Copy ID"
          active={copied === "id"}
          onClick={() => handleCopy(profile?.id || "", "id")}
        />
        <QuickAction
          icon={QrCode}
          label="QR Code"
          onClick={() => {
            hapticFeedback("light");
            setShowQR(true);
          }}
        />
        <QuickAction
          icon={Share2}
          label="Share"
          onClick={handleShare}
          disabled={!navigator.share}
        />
        <QuickAction
          icon={Download}
          label="Save"
          onClick={() => hapticFeedback("light")}
        />
      </div>

      {/* Safety Score Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <div className={cn("p-4", safetyColor.light)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", safetyColor.bg)}>
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Safety Score</p>
                  <p className="text-xs text-muted-foreground">Based on travel behavior</p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn("text-3xl font-bold", safetyColor.text)}>{safetyScore}</p>
                <p className="text-[10px] text-muted-foreground">/ 100</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>Excellent standing • Keep it up!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Button */}
      <button
        className="w-full"
        onClick={() => {
          hapticFeedback("light");
          setShowDetails(true);
        }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Profile Details</p>
                  <p className="text-xs text-muted-foreground">View all your information</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </button>

      {/* Verification Badge */}
      <Card className="overflow-hidden border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <Lock className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-emerald-900">Blockchain Verified</h3>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Secure</Badge>
              </div>
              <p className="text-xs text-emerald-700/80 mb-2">
                Your identity is immutably secured on the blockchain
              </p>
              {profile?.idHash && (
                <button
                  className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700"
                  onClick={() => handleCopy(profile.idHash || "", "hash")}
                >
                  <code className="bg-emerald-100 px-2 py-1 rounded font-mono truncate max-w-50">
                    {profile.idHash}
                  </code>
                  {copied === "hash" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Link */}
      {verificationUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Link className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">Public Verification</p>
                  <p className="text-xs text-muted-foreground">Anyone can verify your ID</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => {
                  hapticFeedback("light");
                  window.open(verificationUrl, "_blank");
                }}
              >
                Open
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Sheet */}
      <Sheet open={showQR} onOpenChange={setShowQR}>
        <SheetContent side="bottom" className="rounded-t-3xl h-auto pb-10">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">Verification QR Code</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center">
            <div className="relative p-6 bg-white rounded-3xl shadow-xl border">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">
                Scan to Verify
              </div>
              <div className="h-56 w-56 bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center">
                <div className="relative">
                  <QrCode className="h-32 w-32 text-slate-800" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-xl bg-white shadow flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm font-medium text-slate-900">
                {profile?.name || session.name}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">
                  <Verified className="mr-1 h-3 w-3" />
                  Verified Identity
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-70">
                Authorities can scan this code to instantly verify your identity
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Details Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[85vh]">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Details
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto -mx-6 px-6 pb-8">
            <div className="space-y-1 divide-y">
              <ProfileRow
                icon={Fingerprint}
                label="Tourist ID"
                value={profile?.id || "—"}
                copyable
                onCopy={() => handleCopy(profile?.id || "", "id")}
                copied={copied === "id"}
              />
              <ProfileRow icon={User} label="Full Name" value={profile?.name || "—"} />
              <ProfileRow icon={Mail} label="Email" value={profile?.email || "—"} />
              <ProfileRow icon={Phone} label="Phone" value={profile?.phone || "—"} />
              <ProfileRow
                icon={FileText}
                label="Passport"
                value={profile?.passportNumber ? `****${profile.passportNumber.slice(-4)}` : "—"}
              />
              <ProfileRow icon={Globe} label="Nationality" value={profile?.nationality || "—"} />
              <ProfileRow icon={MapPin} label="Address" value={profile?.address || "—"} />
              <ProfileRow
                icon={Calendar}
                label="Date of Birth"
                value={profile?.dateOfBirth || "—"}
              />
              <ProfileRow
                icon={Clock}
                label="ID Expiry"
                value={profile?.idExpiry || "—"}
              />
              <ProfileRow
                icon={Activity}
                label="Status"
                value="Active"
                badge
                badgeColor="emerald"
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

function QuickAction({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: typeof Copy;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
        active && "bg-emerald-50 border-emerald-200",
        disabled && "opacity-50",
        !active && !disabled && "bg-white hover:bg-slate-50"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className={cn("h-5 w-5", active ? "text-emerald-600" : "text-slate-600")} />
      <span className={cn("text-[10px] font-medium", active ? "text-emerald-600" : "text-slate-600")}>
        {active ? "Copied!" : label}
      </span>
    </button>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  copyable,
  onCopy,
  copied,
  badge,
  badgeColor,
}: {
  icon: typeof User;
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  badge?: boolean;
  badgeColor?: "emerald" | "blue" | "amber";
}) {
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </p>
        {badge ? (
          <Badge className={cn("mt-1 text-xs", colors[badgeColor || "emerald"])}>{value}</Badge>
        ) : (
          <p className="text-sm font-medium mt-0.5 truncate">{value}</p>
        )}
      </div>
      {copyable && onCopy && (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={onCopy}>
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      )}
    </div>
  );
}

export default Identity;
