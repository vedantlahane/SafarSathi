import type { ReactNode } from "react";
import { CheckCircle2, Bell, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type PermissionState = "granted" | "denied" | "unknown";

interface PermissionStepProps {
  locationPermission: PermissionState;
  notificationPermission: PermissionState;
  onRequestLocation: () => void;
  onRequestNotifications: () => void;
  onContinue: () => void;
  canContinue: boolean;
}

function PermissionRow({
  title,
  desc,
  state,
  icon,
  onRequest,
}: {
  title: string;
  desc: string;
  state: PermissionState;
  icon: ReactNode;
  onRequest: () => void;
}) {
  return (
    <div className="glass-2 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </div>

        {state === "granted" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : state === "denied" ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Button size="sm" variant="outline" onClick={onRequest} className="h-8">
            Allow
          </Button>
        )}
      </div>
    </div>
  );
}

export function PermissionStep({
  locationPermission,
  notificationPermission,
  onRequestLocation,
  onRequestNotifications,
  onContinue,
  canContinue,
}: PermissionStepProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-16 pb-8">
      <h2 className="text-2xl font-bold">Enable safety permissions</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        YatraX uses these only for alerts, route safety, and SOS dispatch.
      </p>

      <div className="mt-6 space-y-3">
        <PermissionRow
          title="Location"
          desc="Needed for safety score, nearby police/hospital ETAs, and SOS accuracy."
          state={locationPermission}
          onRequest={onRequestLocation}
          icon={<MapPin className="h-5 w-5 text-primary" />}
        />

        <PermissionRow
          title="Notifications"
          desc="Get urgent alerts and safety score changes in real time."
          state={notificationPermission}
          onRequest={onRequestNotifications}
          icon={<Bell className="h-5 w-5 text-primary" />}
        />
      </div>

      <Button
        className="mt-auto h-12 rounded-xl"
        onClick={onContinue}
        disabled={!canContinue}
      >
        Continue
      </Button>
    </div>
  );
}
