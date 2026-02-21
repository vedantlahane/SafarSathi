import { Wifi, WifiOff, Activity, Star, User, ChevronRight, Lock, Link, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";

import { useIdentity } from "./hooks/use-identity";
import { getSafetyColor } from "./types";
import { NotSignedIn } from "./components/not-signed-in";
import { IDCard } from "./components/id-card";
import { IDQuickActions } from "./components/quick-actions";
import { ProfileSheet } from "./components/profile-sheet";
import { QRSheet } from "./components/qr-sheet";

const Identity = () => {
  const id = useIdentity();
  if (!id.session?.touristId) return <NotSignedIn />;

  if (id.loading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );

  const safetyScore = id.profile?.safetyScore ?? 100;
  const safetyColor = getSafetyColor(safetyScore);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Connection Status */}
      <div className={cn("flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors", id.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
        {id.isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        {id.isOnline ? "Connected • ID Verified" : "Offline Mode • ID Available"}
      </div>

      {/* ID Card */}
      <IDCard profile={id.profile} sessionName={id.session.name} safetyScore={safetyScore} safetyColor={safetyColor} onShowQR={() => id.setShowQR(true)} />

      {/* Quick Actions */}
      <IDQuickActions copied={id.copied} onCopyId={() => id.handleCopy(id.profile?.id || "", "id")} onShowQR={() => id.setShowQR(true)} onShare={id.handleShare} shareAvailable={!!navigator.share} />

      {/* Safety Score Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardContent className="p-0">
          <div className={cn("p-4", safetyColor.light)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", safetyColor.bg)}><Activity className="h-6 w-6 text-white" /></div>
                <div><p className="text-sm font-bold text-slate-900">Safety Score</p><p className="text-xs text-muted-foreground">Based on travel behavior</p></div>
              </div>
              <div className="text-right"><p className={cn("text-3xl font-bold", safetyColor.text)}>{safetyScore}</p><p className="text-[10px] text-muted-foreground">/ 100</p></div>
            </div>
          </div>
          <div className="p-4 border-t"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Star className="h-3.5 w-3.5 text-amber-500" /><span>Excellent standing • Keep it up!</span></div></div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <button className="w-full" onClick={() => { hapticFeedback("light"); id.setShowDetails(true); }}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow"><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100"><User className="h-5 w-5 text-slate-600" /></div>
              <div className="text-left"><p className="text-sm font-bold">Profile Details</p><p className="text-xs text-muted-foreground">View all your information</p></div>
            </div><ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent></Card>
      </button>

      {/* Blockchain Verification */}
      <Card className="overflow-hidden border-emerald-200 bg-linear-to-br from-emerald-50 to-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100"><Lock className="h-6 w-6 text-emerald-600" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1"><h3 className="text-sm font-bold text-emerald-900">Blockchain Verified</h3><Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Secure</Badge></div>
              <p className="text-xs text-emerald-700/80 mb-2">Your identity is immutably secured on the blockchain</p>
              {id.profile?.idHash && (
                <button className="flex items-center gap-2 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => id.handleCopy(id.profile?.idHash || "", "hash")}>
                  <code className="bg-emerald-100 px-2 py-1 rounded font-mono truncate max-w-50">{id.profile.idHash}</code>
                  {id.copied === "hash" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Link */}
      {id.verificationUrl && (
        <Card className="overflow-hidden"><CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Link className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm font-bold">Public Verification</p><p className="text-xs text-muted-foreground">Anyone can verify your ID</p></div></div>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => { hapticFeedback("light"); window.open(id.verificationUrl!, "_blank"); }}>Open<ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </CardContent></Card>
      )}

      {/* Sheets */}
      <QRSheet open={id.showQR} onOpenChange={id.setShowQR} name={id.profile?.name || id.session.name} />
      <ProfileSheet open={id.showDetails} onOpenChange={id.setShowDetails} profile={id.profile} copied={id.copied} onCopy={id.handleCopy} />
    </div>
  );
};

export default Identity;
