import { useState } from "react";
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

  const handleLogout = () => {
    clearAdminSession();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
      {/* Top Navigation — glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-slate-900 tracking-tight">SafarSathi</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Admin Console</div>
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
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      activeTab === item.id
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/80"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.id === "alerts" && (
                      <Badge className={cn(
                        "ml-1 h-5 min-w-5 px-1.5 text-[10px] font-bold",
                        activeTab === "alerts"
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-red-100 text-red-600 border-red-200/60"
                      )}>
                        3
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-56 pl-10 h-9 bg-white/60 backdrop-blur border-slate-200/60 rounded-xl focus:bg-white transition-colors"
                />
              </div>

              {/* Live Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur border border-emerald-200/60">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">Live</span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2 rounded-xl hover:bg-white/60">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">
                        {session.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-slate-900">{session.name || "Admin"}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{session.departmentCode}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/80 backdrop-blur-xl border-slate-200/60 rounded-xl shadow-xl">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="font-semibold text-slate-900">{session.name}</div>
                    <div className="text-xs text-slate-500">{session.email}</div>
                  </div>
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
          <div className="md:hidden border-t border-slate-100/60 px-4 py-2 overflow-x-auto">
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200",
                    activeTab === item.id
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-white/80"
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
        <AdminPanel activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
