import { memo } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAVIGATE_TAB_EVENT, type NavigateTabDetail } from "@/pages/user/home/types";
import { hapticFeedback } from "@/lib/store";

/** Empty state when no ID has been created */
function IDEmptyStateInner() {
    const navigate = () => {
        hapticFeedback("light");
        window.dispatchEvent(
            new CustomEvent<NavigateTabDetail>(NAVIGATE_TAB_EVENT, {
                detail: { tab: "settings" },
            })
        );
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h2 className="text-lg font-semibold mb-2">Create Your Digital Tourist ID</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Your digital identity card for safe travel in Assam. It helps emergency services identify and assist you.
            </p>
            <Button 
                className="w-full max-w-xs h-12" 
                aria-label="Get Started creating your Tourist ID"
                onClick={navigate}
            >
                Get Started
            </Button>
        </div>
    );
}

export const IDEmptyState = memo(IDEmptyStateInner);
