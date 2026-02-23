import { memo } from "react";
import { Bell, Volume2, Vibrate, Clock } from "lucide-react";
import { SettingsItem } from "./settings-item";

interface NotificationSettingsProps {
    pushNotifications: boolean;
    setPushNotifications: (v: boolean) => void;
    alertSounds: boolean;
    setAlertSounds: (v: boolean) => void;
    vibration: boolean;
    setVibration: (v: boolean) => void;
    quietHours: boolean;
    setQuietHours: (v: boolean) => void;
}

function NotificationSettingsInner(p: NotificationSettingsProps) {
    return (
        <div className="divide-y divide-border">
            <SettingsItem icon={Bell} iconBg="bg-red-100 dark:bg-red-900/30" iconColor="text-red-600 dark:text-red-400"
                label="Push Notifications" description="Receive safety alerts & updates"
                checked={p.pushNotifications} onCheckedChange={p.setPushNotifications} />
            <SettingsItem icon={Volume2} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400"
                label="Alert Sounds" description="Audio feedback for actions"
                checked={p.alertSounds} onCheckedChange={p.setAlertSounds} />
            <SettingsItem icon={Vibrate} iconBg="bg-purple-100 dark:bg-purple-900/30" iconColor="text-purple-600 dark:text-purple-400"
                label="Vibration Feedback" description="Haptic response on interactions"
                checked={p.vibration} onCheckedChange={p.setVibration} />
            <SettingsItem icon={Clock} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400"
                label="Quiet Hours" description="Silence alerts 10 PM – 6 AM"
                checked={p.quietHours} onCheckedChange={p.setQuietHours} />
        </div>
    );
}

export const NotificationSettings = memo(NotificationSettingsInner);
