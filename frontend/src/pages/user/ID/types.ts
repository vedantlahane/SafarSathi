/** Tourist profile data returned from the backend */
export interface TouristProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photoUrl?: string;
    country?: string;
    nationality?: string;
    touristId?: string;
    bloodType?: string;
    allergies?: string[];
    emergencyContact?: { name?: string; phone?: string };
    medicalConditions?: string[];
    validFrom?: string;
    validUntil?: string;
    verified?: boolean;
    address?: string;
    dateOfBirth?: string;
    passportNumber?: string;
    gender?: string;
    idHash?: string;
    idExpiry?: string;
    safetyScore?: number;
}

/** Data needed to render the ID card */
export interface IDCardData {
    profile: TouristProfile | null;
    sessionName?: string;
    isFlipped: boolean;
    onFlip: () => void;
}

export function getSafetyColor(score: number) {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50" };
    if (score >= 50) return { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-50" };
    return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-50" };
}
