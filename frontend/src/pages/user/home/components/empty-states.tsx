import { memo } from "react";
import { CheckCircle2, Shield } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface EmptyStatesProps {
    variant: "all-clear" | "not-signed-in";
}

function EmptyStatesInner({ variant }: EmptyStatesProps) {
    if (variant === "all-clear") {
        return (
            <GlassCard level={3} className="flex flex-col items-center p-6 text-center">
                <CheckCircle2 className="h-8 w-8 mb-2" style={{ color: "var(--theme-primary)" }} />
                <p className="text-sm font-bold">All Clear!</p>
                <p className="text-xs text-muted-foreground">No active alerts</p>
            </GlassCard>
        );
    }

    return (
        <GlassCard level={3} className="flex flex-col items-center p-8 text-center border-dashed border-2">
            <Shield className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-bold">Sign in to Stay Safe</h3>
            <p className="text-xs text-muted-foreground mt-1">
                Access alerts and real-time safety updates
            </p>
            <Button size="sm" className="mt-3" aria-label="Get started with SafarSathi">
                Get Started
            </Button>
        </GlassCard>
    );
}

export const EmptyStates = memo(EmptyStatesInner);
