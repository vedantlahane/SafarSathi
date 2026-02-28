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
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="h-16 px-6 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slate-900">SafarSathi</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Admin Console</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            {session?.adminId && (
              <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.id === "alerts" && (
                      <Badge className="ml-1 h-5 min-w-5 px-1.5 bg-red-500 text-white text-[10px]">
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
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden lg:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-64 pl-10 h-9 bg-slate-50 border-slate-200"
                />
              </div>

              {/* Live Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-700">Live</span>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 px-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {session.name?.charAt(0) || "A"}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-slate-900">{session.name || "Admin"}</div>
                      <div className="text-[10px] text-slate-500">{session.departmentCode}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <div className="font-medium text-slate-900">{session.name}</div>
                    <div className="text-xs text-slate-500">{session.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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
          <div className="md:hidden border-t border-slate-100 px-4 py-2 overflow-x-auto">
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                    activeTab === item.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
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
