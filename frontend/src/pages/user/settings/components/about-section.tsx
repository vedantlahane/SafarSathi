import { memo } from "react";
import { Info, FileText, Shield, HelpCircle } from "lucide-react";
import { SettingsItem } from "./settings-item";

function AboutSectionInner() {
    return (
        <div className="divide-y divide-border">
            <SettingsItem icon={Info} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
                label="Version" type="static" value="v1.0.0" />
            <SettingsItem icon={FileText} iconBg="bg-slate-100 dark:bg-slate-800" iconColor="text-slate-600 dark:text-slate-400"
                label="Terms of Service" type="navigate" />
            <SettingsItem icon={Shield} iconBg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600 dark:text-emerald-400"
                label="Privacy Policy" type="navigate" />
            <SettingsItem icon={HelpCircle} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400"
                label="Support" type="navigate" />
        </div>
    );
}

export const AboutSection = memo(AboutSectionInner);
