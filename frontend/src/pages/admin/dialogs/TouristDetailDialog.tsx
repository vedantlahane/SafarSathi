import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Phone, MapPin, Clock, AlertTriangle,
  Navigation, Radio, QrCode, Heart, User, Gauge, Wind,
  Compass, Shield, Calendar, Fingerprint, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Tourist } from "../types";

interface TouristDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourist: Tourist | null;
  onContact?: (tourist: Tourist) => void;
  onTrack?: (tourist: Tourist) => void;
  onBroadcast?: (tourist: Tourist) => void;
  onRefresh?: () => void;
}

const RISK_PILL: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  high:     "bg-orange-100 text-orange-700 border-orange-300",
  medium:   "bg-amber-100 text-amber-700 border-amber-300",
  low:      "bg-emerald-100 text-emerald-700 border-emerald-300",
};

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const danger = 100 - clamped;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - clamped / 100);
  const color = clamped >= 80 ? "#22c55e" : clamped >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{clamped}</span>
        <span className="text-[9px] text-slate-400">{danger > 60 ? "Danger" : danger > 30 ? "Caution" : "Safe"}</span>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{label}</span>
        <span className="text-slate-700 font-medium break-words">{value}</span>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
      {children}
    </span>
  );
}

export function TouristDetailDialog({
  open, onOpenChange, tourist, onContact, onTrack, onBroadcast, onRefresh
}: TouristDetailDialogProps) {
  const [tab, setTab] = useState<"profile" | "medical" | "location" | "override">("profile");
  const [penaltyInput, setPenaltyInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!tourist) return null;

  const risk = tourist.riskLevel || "low";
  const riskClass = RISK_PILL[risk] ?? RISK_PILL.low;
  const safetyScore = tourist.safetyScore ?? (100 - tourist.riskScore);

  const headingLabel = tourist.heading != null
    ? (() => {
        const h = ((tourist.heading % 360) + 360) % 360;
        const dirs = ["N","NE","E","SE","S","SW","W","NW"];
        return dirs[Math.round(h / 45) % 8];
      })()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {tourist.name?.charAt(0) || "T"}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${tourist.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                {tourist.name}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${riskClass}`}>
                  {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5 text-slate-500">
                {tourist.email} · {tourist.isActive ? "🟢 Online" : "⚫ Offline"}
              </DialogDescription>
            </div>
            <ScoreRing score={safetyScore} />
          </div>
          {/* Tab bar */}
          <div className="flex gap-1 mt-3">
            {(["profile","medical","location","override"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* ── Profile Tab ── */}
          {tab === "profile" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow icon={Phone} label="Phone" value={tourist.phoneNumber} />
                <InfoRow icon={Globe} label="Nationality" value={tourist.nationality} />
                <InfoRow icon={User} label="Gender" value={tourist.gender} />
                <InfoRow icon={Calendar} label="Date of Birth" value={tourist.dateOfBirth ? format(new Date(tourist.dateOfBirth), "dd MMM yyyy") : null} />
                <InfoRow icon={Fingerprint} label="Passport" value={tourist.passportNumber || null} />
                <InfoRow icon={Shield} label="Travel Type" value={tourist.travelType} />
              </div>

              {tourist.idHash && (
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3 border border-slate-200">
                  <QrCode className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Digital ID Hash</p>
                    <p className="text-xs font-mono text-slate-600 truncate">{tourist.idHash}</p>
                    {tourist.idExpiry && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Expires: {format(new Date(tourist.idExpiry), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {tourist.emergencyContact && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Emergency Contact
                  </h4>
                  <p className="text-sm text-red-700 font-medium">{tourist.emergencyContact.name}</p>
                  <p className="text-xs text-red-600">{tourist.emergencyContact.phone} · {tourist.emergencyContact.relationship}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Last Seen</p>
                  <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tourist.lastSeen
                      ? formatDistanceToNow(new Date(tourist.lastSeen), { addSuffix: true })
                      : "N/A"}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Safety Score</p>
                  <p className="text-xs font-bold" style={{ color: safetyScore >= 80 ? "#22c55e" : safetyScore >= 50 ? "#f59e0b" : "#ef4444" }}>
                    {safetyScore} / 100
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ── Medical Tab ── */}
          {tab === "medical" && (
            <>
              {tourist.bloodType ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-red-400 uppercase tracking-wider">Blood Type</p>
                    <p className="text-xl font-bold text-red-700">{tourist.bloodType}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No blood type on file</p>
              )}

              {tourist.allergies && tourist.allergies.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tourist.allergies.map((a) => (
                      <Tag key={a}>{a}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {tourist.medicalConditions && tourist.medicalConditions.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Medical Conditions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tourist.medicalConditions.map((c) => (
                      <Tag key={c}>{c}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {!tourist.bloodType && !tourist.allergies?.length && !tourist.medicalConditions?.length && (
                <div className="text-center py-8 text-slate-400">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No medical information on file</p>
                </div>
              )}
            </>
          )}

          {/* ── Location Tab ── */}
          {tab === "location" && (
            <>
              {tourist.location ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Current Coordinates</p>
                  <p className="text-sm font-mono text-blue-700">
                    {tourist.location.lat.toFixed(6)}, {tourist.location.lng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
                  <MapPin className="w-5 h-5 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs text-slate-400">Location not available</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {tourist.speed != null && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <Gauge className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Speed</p>
                    <p className="text-sm font-bold text-slate-700">{tourist.speed.toFixed(1)} <span className="text-[10px] font-normal">km/h</span></p>
                  </div>
                )}
                {headingLabel && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <Compass className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Heading</p>
                    <p className="text-sm font-bold text-slate-700">{headingLabel}</p>
                  </div>
                )}
                {tourist.locationAccuracy != null && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <Wind className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Accuracy</p>
                    <p className="text-sm font-bold text-slate-700">±{tourist.locationAccuracy.toFixed(0)}<span className="text-[10px] font-normal">m</span></p>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Last Seen</p>
                <p className="text-sm text-slate-700">
                  {tourist.lastSeen ? format(new Date(tourist.lastSeen), "dd MMM yyyy, h:mm a") : "N/A"}
                </p>
              </div>
            </>
          )}

          {/* ── Override Tab ── */}
          {tab === "override" && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Admin Manual Override
                </h4>
                <p className="text-xs text-orange-700 mb-4">
                  Set a manual penalty (0 to 10) to artificially reduce this tourist's safety score. 
                  A penalty of 10 drops the score completely to 0. 
                  Currently set to: <strong className="text-orange-900">{tourist.adminManualPenalty ?? 0}</strong>
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="e.g. 5.5"
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-orange-500"
                    value={penaltyInput}
                    onChange={(e) => setPenaltyInput(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isUpdating}
                    onClick={async () => {
                      if (!penaltyInput) return;
                      setIsUpdating(true);
                      try {
                        const { updateTouristAdmin } = await import("@/lib/api/admin");
                        await updateTouristAdmin(tourist.id, { adminManualPenalty: parseFloat(penaltyInput) });
                        onRefresh?.();
                        setPenaltyInput("");
                        onOpenChange(false);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                  >
                    {isUpdating ? "Saving..." : "Apply Penalty"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-3 border-t border-slate-100 gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onBroadcast && (
            <Button
              variant="outline" size="sm"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => { onBroadcast(tourist); onOpenChange(false); }}
            >
              <Radio className="w-3.5 h-3.5 mr-1.5" /> Message
            </Button>
          )}
          {onContact && (
            <Button
              variant="outline" size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => onContact(tourist)}
            >
              <Phone className="w-3.5 h-3.5 mr-1.5" /> Call
            </Button>
          )}
          {onTrack && tourist.location && (
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => { onTrack(tourist); onOpenChange(false); }}
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5" /> Track
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
