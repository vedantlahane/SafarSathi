import { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Bell,
  Users,
  Map,
  Building2,
  LogOut,
  Search,
  ChevronDown,
  Shield,
  Hospital,
  FileWarning,
  ScrollText,
  Settings,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdminPanel } from "@/pages/admin";
import { clearAdminSession, useAdminSession } from "@/lib/session";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "tourists", label: "Tourists", icon: Users },
  { id: "zones", label: "Risk Zones", icon: Map },
  { id: "police", label: "Police Units", icon: Building2 },
  { id: "hospitals", label: "Hospitals", icon: Hospital },
  { id: "advisories", label: "Advisories", icon: FileWarning },
  { id: "auditlog", label: "Audit Log", icon: ScrollText },
];

export default function AdminLayout() {
  const session = useAdminSession();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");
  const [alertBadgeCount, setAlertBadgeCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleLogout = () => {
    clearAdminSession();
  };

  const handleAlertCountUpdate = useCallback((count: number) => {
    setAlertBadgeCount(count);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 relative overflow-hidden">
      {/* iOS Glass Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-200/25 rounded-full blur-3xl animate-[mesh-drift-1_60s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-200/20 rounded-full blur-3xl animate-[mesh-drift-2_55s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-emerald-200/15 rounded-full blur-3xl animate-[mesh-drift-3_65s_ease-in-out_infinite]" />
        <div className="absolute top-[60%] left-[30%] w-[25%] h-[25%] bg-sky-200/20 rounded-full blur-3xl animate-[mesh-drift-4_50s_ease-in-out_infinite]" />
      </div>
      {/* Top Navigation — iOS-style frosted glass */}
      <header className="sticky top-0 z-50 glass-bar border-b border-white/30">
        <div className="h-14 px-5 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-md shadow-slate-900/15">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">SafarSathi</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Admin Console</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            {session?.adminId && (
              <nav className="hidden md:flex items-center gap-0.5">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                      activeTab === item.id
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {item.id === "alerts" && alertBadgeCount > 0 && (
                      <Badge className={cn(
                        "ml-1 h-5 min-w-5 px-1.5 text-[10px] font-bold",
                        activeTab === "alerts"
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-red-100 text-red-600 border-red-200/60"
                      )}>
                        {alertBadgeCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Right Section */}
          {session?.adminId && (
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden lg:flex relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-48 pl-8 pr-7 h-8 text-[13px] bg-white/30 backdrop-blur border-white/40 rounded-xl focus:bg-white/60 transition-colors"
                />
                {globalSearch && (
                  <button
                    onClick={() => setGlobalSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Live Status */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/50 backdrop-blur border border-emerald-200/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold text-emerald-700">Live</span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 gap-1.5 px-1.5 rounded-xl hover:bg-white/40">
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white">
                        {session.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-[13px] font-semibold text-slate-900 leading-tight">{session.name || "Admin"}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{session.departmentCode}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass-elevated border-white/30 rounded-2xl shadow-xl">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="font-semibold text-slate-900">{session.name}</div>
                    <div className="text-xs text-slate-500">{session.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="rounded-lg mx-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setReportsOpen(true)} className="rounded-lg mx-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Reports
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50/80 rounded-lg mx-1">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {session?.adminId && (
          <div className="md:hidden border-t border-white/20 px-3 py-1.5 overflow-x-auto">
            <nav className="flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all duration-200",
                    activeTab === item.id
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-white/40"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <AdminPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          globalSearch={globalSearch}
          onAlertCountUpdate={handleAlertCountUpdate}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
          reportsOpen={reportsOpen}
          onReportsOpenChange={setReportsOpen}
        />
      </main>
    </div>
  );
}
