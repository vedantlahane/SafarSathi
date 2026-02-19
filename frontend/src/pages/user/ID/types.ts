import type { LucideIcon } from "lucide-react";

export interface ProfileField {
    icon: LucideIcon;
    label: string;
    value: string;
    copyable?: boolean;
    badge?: boolean;
    badgeColor?: "emerald" | "blue" | "amber";
}

export function getSafetyColor(score: number) {
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-500", light: "bg-emerald-50" };
    if (score >= 50) return { bg: "bg-amber-500", text: "text-amber-500", light: "bg-amber-50" };
    return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-50" };
}
