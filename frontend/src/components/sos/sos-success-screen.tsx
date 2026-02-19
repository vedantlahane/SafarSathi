import { memo, useCallback, useState } from "react";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSOS } from "./use-sos";
import { hapticFeedback } from "@/lib/store";

/**
 * Full-screen post-SOS success screen.
 * Shows animated checkmark, status, emergency call, and dismiss.
 */
function SOSSuccessScreenInner() {
    const { phase, dismissSuccess } = useSOS();
    const [confirmDismiss, setConfirmDismiss] = useState(false);

    const handleDismiss = useCallback(() => {
        if (!confirmDismiss) {
            setConfirmDismiss(true);
            hapticFeedback("medium");
            return;
        }
        hapticFeedback("light");
        setConfirmDismiss(false);
        dismissSuccess();
    }, [confirmDismiss, dismissSuccess]);

    if (phase !== "success" && phase !== "firing") return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[70] flex flex-col items-center justify-center",
                "px-6 gap-6",
            )}
            style={{
                background: "linear-gradient(180deg, rgba(22, 163, 74, 0.95) 0%, rgba(21, 128, 61, 0.98) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
            }}
            role="alert"
            aria-live="assertive"
        >
            {phase === "firing" ? (
                <>
                    <div className="h-20 w-20 rounded-full border-4 border-white/40 border-t-white animate-spin" />
                    <p className="text-white text-xl font-bold">Sending SOS...</p>
                </>
            ) : (
                <>
                    {/* Animated checkmark */}
                    <div className="animate-scale-in">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
                            <CheckCircle2 className="h-16 w-16 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white text-center">
                        Help is on the way
                    </h1>

                    {/* Status updates */}
                    <div className="flex flex-col items-center gap-2 text-white/90">
                        <div className="flex items-center gap-2 animate-pulse">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Alerting nearby authorities...
                            </span>
                        </div>
                        <span className="text-xs text-white/70">
                            Your location has been shared
                        </span>
                    </div>

                    {/* Emergency call button */}
                    <a
                        href="tel:112"
                        className="mt-4 w-full max-w-xs"
                        onClick={() => hapticFeedback("medium")}
                    >
                        <Button
                            variant="outline"
                            className="w-full h-14 rounded-2xl text-base font-bold gap-3 bg-white/15 border-white/30 text-white hover:bg-white/25"
                            aria-label="Call Emergency Services 112"
                        >
                            <Phone className="h-5 w-5" />
                            Call Emergency (112)
                        </Button>
                    </a>

                    {/* Dismiss button */}
                    <Button
                        variant="ghost"
                        className={cn(
                            "mt-2 w-full max-w-xs h-12 rounded-2xl font-bold",
                            confirmDismiss
                                ? "bg-red-600/40 text-white border border-white/30"
                                : "text-white/70 hover:text-white hover:bg-white/10",
                        )}
                        onClick={handleDismiss}
                        aria-label={confirmDismiss ? "Confirm I'm safe" : "I'm safe — dismiss"}
                    >
                        {confirmDismiss ? "Tap again to confirm I'm Safe" : "I'm Safe"}
                    </Button>
                </>
            )}
        </div>
    );
}

export const SOSSuccessScreen = memo(SOSSuccessScreenInner);
