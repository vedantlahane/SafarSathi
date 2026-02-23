import { memo } from "react";
import { IDCardFlip } from "./id-card-flip";
import { IDCardFront } from "./id-card-front";
import { IDCardBack } from "./id-card-back";
import { hapticFeedback } from "@/lib/store";
import type { TouristProfile } from "../types";

interface IDCardProps {
    profile: TouristProfile | null;
    sessionName?: string;
    isFlipped: boolean;
    onFlip: () => void;
}

/** Outer container — manages flip state and composes front/back faces */
function IDCardInner({ profile, sessionName, isFlipped, onFlip }: IDCardProps) {
    const handleFlip = () => {
        hapticFeedback("light");
        onFlip();
    };

    return (
        <div className="relative">
            <IDCardFlip
                isFlipped={isFlipped}
                onFlip={handleFlip}
                front={<IDCardFront profile={profile} sessionName={sessionName} />}
                back={<IDCardBack profile={profile} />}
            />
            {/* Tap hint */}
            <p className="text-center text-[10px] text-muted-foreground mt-2">
                Tap card to {isFlipped ? "see details" : "see QR code"}
            </p>
        </div>
    );
}

export const IDCard = memo(IDCardInner);
