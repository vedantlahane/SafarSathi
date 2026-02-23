import { memo } from "react";
import { Share2, Download, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/store";

interface QuickActionsProps {
    onShare: () => void;
    onViewDetails: () => void;
    shareAvailable: boolean;
}

function QuickActionsInner({ onShare, onViewDetails, shareAvailable }: QuickActionsProps) {
    return (
        <div className="space-y-3">
            {/* Row 1: 2-col grid */}
            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl bg-muted/30 border border-border"
                    onClick={() => { hapticFeedback("light"); onShare(); }}
                    disabled={!shareAvailable}
                    aria-label="Share ID"
                >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Share2 className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Share ID</span>
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 rounded-2xl bg-muted/30 border border-border"
                    onClick={() => hapticFeedback("light")}
                    aria-label="Download PDF"
                >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Download className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Download PDF</span>
                </Button>
            </div>

            {/* Row 2: Full width */}
            <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-muted/30 border border-border"
                onClick={() => { hapticFeedback("light"); onViewDetails(); }}
                aria-label="View Full Details"
            >
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">View Full Details</span>
            </Button>
        </div>
    );
}

export const IDQuickActions = memo(QuickActionsInner);
