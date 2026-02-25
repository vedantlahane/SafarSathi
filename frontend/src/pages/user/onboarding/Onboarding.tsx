import type { ReactNode } from "react";
import { NAVIGATE_TAB_EVENT, type NavigateTabDetail } from "@/pages/user/home/types";
import { hapticFeedback } from "@/lib/store";
import { SplashScreen } from "./components/splash-screen";
import { PermissionStep } from "./components/permission-step";
import { FeatureSlides } from "./components/feature-slides";
import { SOSTutorial } from "./components/sos-tutorial";
import { GetStarted } from "./components/get-started";
import { useOnboarding } from "./hooks/use-onboarding";

export default function Onboarding() {
  const o = useOnboarding();

  if (!o.visible) return null;

  let content: ReactNode = null;

  if (o.step === 0) {
    content = <SplashScreen />;
  } else if (o.step === 1) {
    content = (
      <PermissionStep
        locationPermission={o.locationPermission}
        notificationPermission={o.notificationPermission}
        onRequestLocation={() => void o.requestLocation()}
        onRequestNotifications={() => void o.requestNotifications()}
        canContinue={o.canContinuePermissions}
        onContinue={o.next}
      />
    );
  } else if (o.step === 2) {
    content = <FeatureSlides onNext={o.next} onSkip={o.skipToEnd} />;
  } else if (o.step === 3) {
    content = <SOSTutorial onBack={o.back} onNext={o.next} />;
  } else {
    const openSettingsAuth = () => {
      hapticFeedback("light");
      window.dispatchEvent(
        new CustomEvent<NavigateTabDetail>(NAVIGATE_TAB_EVENT, {
          detail: { tab: "settings" },
        })
      );
      o.complete();
    };

    content = (
      <GetStarted
        onBack={o.back}
        onContinueGuest={o.complete}
        onSignIn={openSettingsAuth}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ backgroundColor: "var(--theme-bg-from)" }}
    >
      {content}
    </div>
  );
}
