import { ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GetStartedProps {
  onContinueGuest: () => void;
  onSignIn: () => void;
  onBack: () => void;
}

export function GetStarted({ onContinueGuest, onSignIn, onBack }: GetStartedProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-14 pb-8">
      <h3 className="text-2xl font-bold">Start safely</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        You can continue now as guest and sign in later from Settings.
      </p>

      <div className="mt-6 space-y-3">
        <div className="glass-2 rounded-2xl p-4">
          <p className="text-sm font-semibold">Guest mode enabled</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Live safety score and alerts</li>
            <li>• Full map and route safety overlays</li>
            <li>• Floating SOS emergency flow</li>
          </ul>
        </div>

        <div className="glass-3 rounded-2xl p-4">
          <p className="text-sm font-semibold">Sign-in unlocks</p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            <li>• Personalized digital tourist ID</li>
            <li>• Emergency profile sharing with responders</li>
            <li>• Profile sync across devices</li>
          </ul>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        <Button className="h-12 w-full rounded-xl" onClick={onSignIn}>
          <UserRound className="mr-2 h-4 w-4" />
          Sign in / Create account
        </Button>
        <Button variant="outline" className="h-12 w-full rounded-xl" onClick={onContinueGuest}>
          <ShieldCheck className="mr-2 h-4 w-4" />
          Continue as guest
        </Button>
        <button className="mt-2 w-full text-xs text-muted-foreground" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
