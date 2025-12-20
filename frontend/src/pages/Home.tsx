import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, ShieldAlert, Bus, Share2 } from "lucide-react";
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
    <div className="space-y-6">
      <section className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-primary"> SafarSathi</h2>
          <p className="text-muted-foreground text-sm">Your Safe Travel Companion</p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg animate-pulse"
          onClick={sendSOS}
        >
          <ShieldAlert className="h-6 w-6 text-black" />
        </Button>
      </section>


      {/* Safety Status Card */}
      <Card className=" p-1  bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <CardContent className="p-6 relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Safety Score</p>
              <h3 className="text-3xl font-bold tracking-tighter mt-1">94%</h3>
            </div>
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold border border-white/10">
              Safe Zone
            </span>
            <span className="px-3 py-1 rounded-full bg-black/20 text-xs font-medium">
              Civil Lines
            </span>
          </div>

          {/* <div className="text-xs text-emerald-100/80">
            Last updated: Just now
          </div> */}
        </CardContent>
      </Card>

      {/* Recent Alerts Grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>

        {/* If no alerts, show a peaceful message */}
        {alerts.length === 0 && (
          <div className="text-center p-8 text-gray-400">
            <p>No recent alerts. Stay safe! 🛡️</p>
          </div>
        )}

        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="shadow-sm">
              <CardContent className="p-4 flex items-start gap-4">
                {/* Icon Container */}
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-red-700 dark:text-red-400">
                      {alert.type}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {alert.message}
                  </p>
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