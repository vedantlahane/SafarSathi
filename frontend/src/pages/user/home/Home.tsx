import { PullToRefresh } from "@/components/PullToRefresh";
import { useAppState } from "@/lib/store";
import { useDashboard } from "./hooks/use-dashboard";
import { useLocationShare } from "./hooks/use-location-share";
import { useNotifications } from "./hooks/use-notifications";
import { HomeHeader } from "./components/home-header";
import { SafetyScoreHero } from "./components/safety-score-hero";
import { QuickActions } from "./components/quick-actions";
import { EmergencyStrip } from "./components/emergency-strip";
import { AlertList } from "./components/alert-list";
import { BroadcastList } from "./components/broadcast-list";
import { AdvisoryList } from "./components/advisory-list";
import { DailyTip } from "./components/daily-tip";
import { OfflineBanner } from "./components/offline-banner";

/**
 * Home page — pure composition root.
 * All logic lives in hooks. All UI lives in sub-components.
 * Max 40 lines. Zero logic.
 */
export default function Home() {
  const { data, loading, refresh, hasSession } = useDashboard();
  const locationShare = useLocationShare();
  const notifications = useNotifications(data.alerts);
  const { isOnline } = useAppState();

  return (
    <PullToRefresh
      onRefresh={refresh}
      className="flex-1 overflow-y-auto no-scrollbar"
    >
      <div className="stagger-children flex flex-col gap-5 px-4 pt-3 pb-8">
        {!isOnline && <OfflineBanner />}
        <HomeHeader
          alertCount={notifications.unreadCount}
          notifications={notifications.notifications}
          onReadNotification={notifications.markRead}
          onMarkAllNotificationsRead={notifications.markAllRead}
        />
        <SafetyScoreHero
          score={data.safetyScore}
          status={data.status}
          recommendation={data.recommendation}
          factors={data.factors}
          loading={loading}
        />
        <QuickActions locationShare={locationShare} hasSession={hasSession} />
        <EmergencyStrip />
        <BroadcastList broadcasts={data.broadcasts} />
        <AdvisoryList advisories={data.advisories} />
        <AlertList alerts={data.alerts} loading={loading} hasSession={hasSession} />
        <DailyTip />
      </div>
    </PullToRefresh>
  );
}