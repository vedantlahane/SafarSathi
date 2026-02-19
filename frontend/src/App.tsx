import { useEffect, useState } from "react";
import UserLayout from "@/layouts/user/UserLayout";
import AdminLayout from "@/layout/admin/AdminLayout";

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
      {isAdmin ? <AdminLayout /> : <UserLayout />}
    </>
  );
}

export default App;
