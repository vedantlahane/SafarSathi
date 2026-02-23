import { memo } from "react";
import { MapPin, Crosshair, Database } from "lucide-react";
import { SettingsItem } from "./settings-item";

interface PrivacySettingsProps {
    locationSharing: boolean;
    setLocationSharing: (v: boolean) => void;
    highAccuracyGps: boolean;
    setHighAccuracyGps: (v: boolean) => void;
    anonymousData: boolean;
    setAnonymousData: (v: boolean) => void;
}

function PrivacySettingsInner(p: PrivacySettingsProps) {
    return (
        <div className="divide-y divide-border">
            <SettingsItem icon={MapPin} iconBg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600 dark:text-emerald-400"
                label="Location Sharing" description="Share location with authorities"
                checked={p.locationSharing} onCheckedChange={p.setLocationSharing} />
            <SettingsItem icon={Crosshair} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
                label="High Accuracy GPS" description="Uses more battery for precision"
                checked={p.highAccuracyGps} onCheckedChange={p.setHighAccuracyGps} />
            <SettingsItem icon={Database} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-600 dark:text-slate-400"
                label="Anonymous Data Collection" description="Help improve safety systems"
                checked={p.anonymousData} onCheckedChange={p.setAnonymousData} />
        </div>
    );
}

export const PrivacySettings = memo(PrivacySettingsInner);
