import { memo } from "react";
import {
  Phone,
  ShieldAlert,
  Heart,
  Flame,
  UserRound,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import { EMERGENCY_CONTACTS, type EmergencyContact } from "../types";

const ICON_MAP: Record<EmergencyContact["iconKey"], typeof Phone> = {
  police: ShieldAlert,
  ambulance: Heart,
  fire: Flame,
  women: UserRound,
  tourist: Compass,
};

function EmergencyStripInner() {
  return (
    <section aria-label="Emergency contacts">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Phone
          className="h-4 w-4 transition-colors duration-2000"
          style={{ color: "var(--theme-primary)" }}
        />
        <h2 className="text-sm font-bold">Emergency</h2>
      </div>

      {/* Horizontal scroll strip with mask-image fades */}
      <div
        className="scroll-fade-x"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        <div
          className="flex gap-4 overflow-x-auto no-scrollbar px-3 py-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {EMERGENCY_CONTACTS.map((contact) => {
            const Icon = ICON_MAP[contact.iconKey];
            return (
              <a
                key={contact.id}
                href={`tel:${contact.number}`}
                className={cn(
                  "flex flex-col items-center gap-1.5 shrink-0",
                  "active:scale-90 transition-transform duration-150",
                  "min-w-[64px] py-1"
                )}
                style={{ scrollSnapAlign: "start" }}
                onClick={() => hapticFeedback("medium")}
                aria-label={`Call ${contact.name} at ${contact.number}`}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full",
                    "text-white shadow-md",
                    contact.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-center leading-tight">
                  {contact.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {contact.number}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const EmergencyStrip = memo(EmergencyStripInner);