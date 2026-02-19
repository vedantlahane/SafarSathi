import { useSettings } from "./hooks/use-settings";
import { AuthView } from "./components/auth-view";
import { LoggedInView } from "./components/logged-in-view";

const Settings = () => {
  const s = useSettings();
  if (!s.session?.touristId) return <AuthView s={s} />;
  return <LoggedInView s={s} />;
};

export default Settings;
