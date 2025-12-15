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
    const [alerts,setAlerts] = useState<AlertItem[]>(mockAlerts);


    const sendSOS = () =>{
        if(!("geolocation" in navigator)) {
    }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary"> SafarSathi</h2>
          <p className="text-muted-foreground">Your Safe Travel Companion</p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg animate-pulse"
        >
          <ShieldAlert className="h-12 w-12 text-black" />
        </Button>
      </section>
    </div>
  );
};

export default Home;
