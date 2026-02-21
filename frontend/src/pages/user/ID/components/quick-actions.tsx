import { memo } from "react";
import { Copy, QrCode, Share2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";

interface QuickActionsProps {
    copied: string | null;
    onCopyId: () => void;
    onShowQR: () => void;
    onShare: () => void;
    shareAvailable: boolean;
}

function QuickActionsInner({ copied, onCopyId, onShowQR, onShare, shareAvailable }: QuickActionsProps) {
    const items: Array<{ icon: typeof Copy; label: string; onClick: () => void; active?: boolean; disabled?: boolean }> = [
        { icon: Copy, label: "Copy ID", onClick: onCopyId, active: copied === "id" },
        { icon: QrCode, label: "QR Code", onClick: () => { hapticFeedback("light"); onShowQR(); } },
        { icon: Share2, label: "Share", onClick: onShare, disabled: !shareAvailable },
        { icon: Download, label: "Save", onClick: () => hapticFeedback("light") },
    ];

    return (
        <div className="grid grid-cols-4 gap-3">
            {items.map(({ icon: Icon, label, onClick, active, disabled }) => (
                <button key={label} disabled={disabled} onClick={onClick}
                    className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
                        active && "bg-emerald-50 border-emerald-200",
                        disabled && "opacity-50",
                        !active && !disabled && "bg-white hover:bg-slate-50",
                    )}>
                    <Icon className={cn("h-5 w-5", active ? "text-emerald-600" : "text-slate-600")} />
                    <span className={cn("text-[10px] font-medium", active ? "text-emerald-600" : "text-slate-600")}>
                        {active && label === "Copy ID" ? "Copied!" : label}
                    </span>
                </button>
            ))}
        </div>
    );
}

export const IDQuickActions = memo(QuickActionsInner);
