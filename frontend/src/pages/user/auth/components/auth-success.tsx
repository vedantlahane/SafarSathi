import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthSuccessProps {
  name: string;
  touristId: string;
  qrContent?: string;
  onContinue: () => void;
}

export function AuthSuccess({ name, touristId, qrContent, onContinue }: AuthSuccessProps) {
  const value = qrContent || `https://yatrax.app/id/${touristId}?emergency=true`;

  return (
    <div className="px-4 pb-8">
      <div className="mt-6 glass-1 rounded-3xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold">Welcome, {name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your digital tourist ID is ready.
        </p>

        <div className="mt-4 flex justify-center">
          <div className="rounded-2xl bg-white p-3">
            <QRCodeSVG value={value} size={140} level="M" bgColor="#ffffff" fgColor="#1e293b" />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">ID: {touristId}</p>
      </div>

      <Button className="mt-6 h-12 w-full rounded-xl" onClick={onContinue}>
        Continue to app
      </Button>
    </div>
  );
}
