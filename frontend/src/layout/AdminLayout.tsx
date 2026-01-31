import { useState } from "react";
import { Shield, Bell, Users, MapPinned, Building2, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Admin from "@/pages/Admin";
import { clearAdminSession, useAdminSession } from "@/lib/session";

const NAV_ITEMS = [
	{ value: "dashboard", label: "Dashboard", icon: Shield },
	{ value: "alerts", label: "Alerts", icon: Bell },
	{ value: "tourists", label: "Tourists", icon: Users },
	{ value: "risk-zones", label: "Risk Zones", icon: MapPinned },
	{ value: "police", label: "Police Units", icon: Building2 }
];

const AdminLayout = () => {
	const session = useAdminSession();
	const [active, setActive] = useState("dashboard");

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<div className="grid min-h-screen grid-cols-[280px_1fr]">
				<aside className="border-r border-slate-200 bg-white/90 backdrop-blur">
					<div className="flex items-center justify-between px-6 py-5">
						<div>
							<div className="text-xs uppercase text-slate-400">SafarSathi</div>
							<div className="text-lg font-semibold">Admin Control</div>
						</div>
						<span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
							Live
						</span>
					</div>

					<nav className="px-4">
						{NAV_ITEMS.map((item) => (
							<button
								key={item.value}
								onClick={() => setActive(item.value)}
								className={cn(
									"flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition",
									active === item.value
										? "bg-slate-900 text-white shadow"
										: "text-slate-600 hover:bg-slate-100"
								)}
							>
								<span className="flex items-center gap-3">
									<item.icon className="h-4 w-4" />
									{item.label}
								</span>
								<ChevronRight className="h-4 w-4 opacity-50" />
							</button>
						))}
					</nav>

					<div className="mt-auto px-6 py-6">
						{session && (
							<div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
								<div className="font-semibold text-slate-900">{session.name}</div>
								<div>{session.departmentCode}</div>
								<div className="text-[11px]">{session.city}, {session.state}</div>
							</div>
						)}
						<Button
							variant="secondary"
							className="w-full justify-center gap-2"
							onClick={() => clearAdminSession()}
						>
							<LogOut className="h-4 w-4" />
							Sign out
						</Button>
					</div>
				</aside>

				<main className="flex flex-col">
					<header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur">
						<div>
							<div className="text-xs uppercase text-slate-400">Operations Center</div>
							<div className="text-lg font-semibold">{NAV_ITEMS.find((i) => i.value === active)?.label}</div>
						</div>
						<div className="text-xs text-slate-500">Desktop-first admin view</div>
					</header>

					<section className="flex-1 p-8">
						<Admin activeSection={active} />
					</section>
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
