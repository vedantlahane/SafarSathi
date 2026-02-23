import { memo } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Empty state when no ID has been created */
function IDEmptyStateInner() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h2 className="text-lg font-semibold mb-2">Create Your Digital Tourist ID</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Your digital identity card for safe travel in Assam. It helps emergency services identify and assist you.
            </p>
            <Button className="w-full max-w-xs h-12" aria-label="Get Started creating your Tourist ID">
                Get Started
            </Button>
        </div>
    );
}

export const IDEmptyState = memo(IDEmptyStateInner);
