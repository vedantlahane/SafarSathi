import { memo } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import { EMERGENCY_CONTACTS } from "../types";

function EmergencyStripInner() {
    return (
        <section id="emergency-strip" aria-label="Emergency contacts">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
                <Phone className="h-4 w-4" style={{ color: "var(--theme-primary)" }} />
                <h2 className="text-sm font-bold">Emergency</h2>
            </div>

            {/* Horizontal scroll strip */}
            <div className="relative">
                {/* Left fade */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent dark:from-slate-950" />
                {/* Right fade */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent dark:from-slate-950" />

                <div
                    className="flex gap-3 overflow-x-auto no-scrollbar px-1 py-1"
                    style={{ scrollSnapType: "x mandatory" }}
                >
                    {EMERGENCY_CONTACTS.map((contact) => (
                        <a
                            key={contact.id}
                            href={`tel:${contact.number}`}
                            className={cn(
                                "flex flex-col items-center gap-1.5 shrink-0",
                                "active:scale-90 transition-transform",
                                "min-w-[60px]",
                            )}
                            style={{ scrollSnapAlign: "start" }}
                            onClick={() => hapticFeedback("medium")}
                            aria-label={`Call ${contact.name} at ${contact.number}`}
                        >
                            <div
                                className={cn(
                                    "flex h-11 w-11 items-center justify-center rounded-full",
                                    "text-white font-bold text-xs",
                                    contact.color,
                                )}
                            >
                                <Phone className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-semibold text-center leading-tight">
                                {contact.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground">{contact.number}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export const EmergencyStrip = memo(EmergencyStripInner);
