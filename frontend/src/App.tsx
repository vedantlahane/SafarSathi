import { useEffect, useState } from "react";
import MobileLayout from "./layout/user/UserLayout"
import AdminLayout from "./layout/AdminLayout"

function App() {
  const [route, setRoute] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const isAdmin = route.startsWith("/admin");
  
  return (
    <>
      {isAdmin ? <AdminLayout /> : <MobileLayout />}
    </>
  );
}

export default App
