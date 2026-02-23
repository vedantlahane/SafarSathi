import { memo } from "react";
import { Phone, Droplets, AlertTriangle, Heart } from "lucide-react";
import { SettingsItem } from "./settings-item";

interface EmergencyProfileProps {
    emergencyContact: string;
    bloodType: string;
    allergies: string;
    medicalConditions: string;
}

function EmergencyProfileInner(p: EmergencyProfileProps) {
    return (
        <div className="divide-y divide-border">
            <SettingsItem icon={Phone} iconBg="bg-red-100 dark:bg-red-900/30" iconColor="text-red-600 dark:text-red-400"
                label="Emergency Contact" type="navigate"
                value={p.emergencyContact || "Not set"} />
            <SettingsItem icon={Droplets} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
                label="Blood Type" type="navigate"
                value={p.bloodType || "Not set"} />
            <SettingsItem icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400"
                label="Allergies" type="navigate"
                value={p.allergies || "Not set"} />
            <SettingsItem icon={Heart} iconBg="bg-pink-100 dark:bg-pink-900/30" iconColor="text-pink-600 dark:text-pink-400"
                label="Medical Conditions" type="navigate"
                value={p.medicalConditions || "Not set"} />
        </div>
    );
}

export const EmergencyProfile = memo(EmergencyProfileInner);
