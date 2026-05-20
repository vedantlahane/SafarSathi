import { Routes, Route, Navigate } from "react-router";
import UserLayout from "@/layouts/user/UserLayout";
import AdminLayout from "@/layout/admin/AdminLayout";
import Home from "@/pages/user/home/Home";
import Map from "@/pages/user/map/Map";
import Identity from "@/pages/user/ID/Identity";
import Settings from "@/pages/user/settings/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="map" element={<Map />} />
        <Route path="identity" element={<Identity />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
  );
}

export default App;
