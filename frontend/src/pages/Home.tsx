import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";

type AlertItem = {
  id: number;
  type: "SOS" | "Alert" | "Info";
  message: string;
  time: string;
};

const mockAlerts: AlertItem[] = [
  {
    id: 1,
    type: "SOS",
    message: "Sos triggered by the user",
    time: "12m ago",
  },
];

const Home = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const sendSOS = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    // MOVED INSIDE THE FUNCTION
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude);
        const newAlert: AlertItem = {
          id: Date.now(),
          type: "SOS",
          message: `Emergency at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          time: "Just now",
        };
        setAlerts((prev) => [newAlert, ...prev]);
      },
      (error) => {
        // Now console.error works because it's the global console
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please enable location services.");
      }
    );
  }; // CLOSING FORCE HERE
  return (
    <div className="space-y-4 text-[13px]">
      <section className="flex items-center justify-end">
        <Button
          variant="destructive"
          size="icon"
          className="h-11 w-11 rounded-full shadow-md"
          onClick={sendSOS}
        >
          <ShieldAlert className="h-5 w-5 text-black" />
        </Button>
      </section>

      <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
        <CardContent className="relative p-4">
          <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-6 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[12px] text-emerald-100">Safety score</p>
              <h3 className="text-2xl font-bold leading-tight">94%</h3>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 backdrop-blur">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">Safe zone</span>
            <span className="rounded-full bg-black/20 px-2.5 py-1">Civil Lines</span>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[13px] font-semibold">
          <span>Recent alerts</span>
          <span className="text-[11px] text-muted-foreground">Live preview</span>
        </div>

        {alerts.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-4 text-center text-[12px] text-muted-foreground">
              No recent alerts. Stay safe! 🛡️
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card key={alert.id} className="shadow-sm">
              <CardContent className="flex items-start gap-3 p-3">
                <div className="rounded-full bg-red-50 p-2 dark:bg-red-900/20">
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="text-[13px] font-semibold text-red-700 dark:text-red-400">
                      {alert.type}
                    </h4>
                    <span className="text-[11px] text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-snug">{alert.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Home;