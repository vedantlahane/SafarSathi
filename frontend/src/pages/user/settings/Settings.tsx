import { useSettings } from "./hooks/use-settings";
import { LoggedInView } from "./components/logged-in-view";
import Auth from "@/pages/user/auth/Auth";

const Settings = () => {
  const s = useSettings();
  if (!s.session?.touristId) return <Auth />;
  return <LoggedInView s={s} />;
};

export default Settings;
