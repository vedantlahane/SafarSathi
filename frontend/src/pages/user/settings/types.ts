import type { LucideIcon } from "lucide-react";

export interface SettingsState {
    notifications: boolean;
    alertSounds: boolean;
    vibration: boolean;
    quietHours: boolean;
    locationSharing: boolean;
    highAccuracyGps: boolean;
    anonymousData: boolean;
}

export interface NotificationPrefs {
    pushNotifications: boolean;
    alertSounds: boolean;
    vibration: boolean;
    quietHours: boolean;
}

export interface PrivacyPrefs {
    locationSharing: boolean;
    highAccuracyGps: boolean;
    anonymousData: boolean;
}

export interface EmergencyProfile {
    emergencyContact: string;
    bloodType: string;
    allergies: string;
    medicalConditions: string;
}

export interface SettingsItemConfig {
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    label: string;
    description?: string;
    value?: string;
    type: "switch" | "navigate" | "static";
}
