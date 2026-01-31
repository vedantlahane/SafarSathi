import { useEffect, useState } from "react";
import MobileLayout from "./layout/user/UserLayout"
import AdminLayout from "./layout/AdminLayout"
function App() {
  const [route, setRoute] = useState<string>(() => window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const isAdmin = route.startsWith("#/admin");
  return (
    <>
      {isAdmin ? <AdminLayout /> : <MobileLayout/>}
    </>
  )
}

export default App
