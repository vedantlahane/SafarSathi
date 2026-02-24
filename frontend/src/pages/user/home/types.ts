/** Safety status derived from score thresholds */
export type SafetyStatus = "safe" | "caution" | "danger";

export interface AlertView {
  id: number;
  type: string;
  message: string;
  time: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface SafetyFactor {
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
}

export interface NotificationView {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "alert" | "score_change" | "system" | "tip";
  read: boolean;
  sourceTab: "home" | "map" | "identity" | "settings";
}

export interface DashboardData {
  safetyScore: number;
  status: SafetyStatus;
  recommendation: string;
  factors: SafetyFactor[];
  alerts: AlertView[];
  openAlerts: number;
}

export interface LocationShareState {
  loading: boolean;
  shared: boolean;
  share: () => void;
}

export interface EmergencyContact {
  id: number;
  name: string;
  number: string;
  color: string;
  iconKey: "police" | "ambulance" | "fire" | "women" | "tourist";
}

export const ALERT_PRIORITY_COLORS: Record<AlertView["priority"], string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-blue-400",
};

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 1, name: "Police", number: "100", color: "bg-blue-600", iconKey: "police" },
  { id: 2, name: "Ambulance", number: "108", color: "bg-red-600", iconKey: "ambulance" },
  { id: 3, name: "Fire", number: "101", color: "bg-orange-600", iconKey: "fire" },
  { id: 4, name: "Women", number: "181", color: "bg-purple-600", iconKey: "women" },
  { id: 5, name: "Tourist", number: "1363", color: "bg-emerald-600", iconKey: "tourist" },
];

export const SAFETY_TIPS: string[] = [
  "Always share your live location with family when exploring new areas.",
  "Keep emergency numbers saved offline — they work even without data.",
  "Avoid isolated areas after dark, especially in unfamiliar terrain.",
  "Register with local tourist police when visiting a new district.",
  "Keep digital and physical copies of all travel documents.",
  "Stay aware of your surroundings in crowded places — watch for pickpockets.",
  "Use only authorized transport services — verify registration plates.",
  "Download offline maps before heading to areas with weak connectivity.",
  "Carry a portable charger — your phone is your safety lifeline.",
  "Learn a few local phrases — it builds trust and helps in emergencies.",
];

/** Dispatched when user taps 'View Map' — listened by UserLayout */
export const NAVIGATE_TAB_EVENT = "yatrax:navigate-tab";

export interface NavigateTabDetail {
  tab: string;
}