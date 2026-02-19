import { memo } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageToastProps { message: { type: "success" | "error"; text: string } | null; }

function MessageToastInner({ message }: MessageToastProps) {
    if (!message) return null;
    return (
        <div className={cn("fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top",
            message.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
            {message.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
        </div>
    );
}

export const MessageToast = memo(MessageToastInner);
