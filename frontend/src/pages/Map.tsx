import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { useState, useMemo } from "react";
import { LocateFixed, Search, Siren, ShieldAlert, Loader2 } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import assamData from "../../../dataSets/assamRistrictedAreas.json";
import policeData from "../../../dataSets/assamPoliceStations.json";

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Default Icon Setup
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Police Icon
const PoliceIcon = L.divIcon({
    html: `<div class="bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
           </div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

// New Search Component
const SearchControl = () => {
    const map = useMap();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setError(null);
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Assam")}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.flyTo([parseFloat(lat), parseFloat(lon)], 14);
            } else {
                setError("No results found.");
            }
        } catch (err) {
            console.error("Search failed:", err);
            setError("Search failed. Check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xl px-2">
            <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search location in Assam..."
                        className={cn(
                            "flex h-11 w-full rounded-full border border-input bg-background/95 backdrop-blur-sm px-10 py-2 text-sm ring-offset-background shadow-lg transition-all",
                            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            loading && "opacity-70"
                        )}
                    />
                </div>
                <Button
                    type="submit"
                    size="icon"
                    className="rounded-full shrink-0 shadow-lg h-11 w-11"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </form>
            {error && (
                <div className="mt-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-full px-3 py-1 inline-flex">
                    {error}
                </div>
            )}
        </div>
    );
};

const LocationButton = () => {
    const map = useMap();
    const handleLocate = () => {
        map.locate().on("locationfound", (e) => {
            map.flyTo(e.latlng, 15);
        });
    };

    return (
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-[1000]">
            <Button
                variant="outline"
                size="icon"
                onClick={handleLocate}
                className="h-12 w-12 rounded-full shadow-2xl bg-background/90 backdrop-blur border border-border hover:bg-accent transition-all active:scale-95"
                title="Find my location"
            >
                <LocateFixed className="h-6 w-6 text-primary" />
            </Button>
        </div>
    );
};

const Map = () => {
    const [position] = useState<[number, number]>([26.1445, 91.7362]);

    // Flatten police stations data
    const allPoliceStations = useMemo(() => {
        return Object.values(policeData.assamPoliceStations).flat();
    }, []);

    return (
        <div className="flex flex-col flex-1 w-full gap-4 min-h-0">
            <Card className="overflow-hidden border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <ShieldAlert className="h-4 w-4" />
                        </span>
                        Safety Map
                    </CardTitle>
                    <CardDescription className="text-[12px]">Risk zones, police availability, and your position.</CardDescription>
                </CardHeader>

                <CardContent className="relative p-0">
                    <MapContainer
                        center={position}
                        zoom={13}
                        scrollWheelZoom
                        style={{ height: "100%", width: "100%", minHeight: 420 }}
                        className="z-0"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <SearchControl />
                        <LocationButton />

                        {/* Render Restricted Zones */}
                        {assamData.restrictedZones.map((zone, index) => (
                            <Circle
                                key={`zone-${index}`}
                                center={[zone.position[0], zone.position[1]]}
                                radius={zone.radius}
                                pathOptions={{
                                    color: zone.riskLevel === "high" ? "#ef4444" : "#f97316",
                                    fillColor: zone.riskLevel === "high" ? "#ef4444" : "#f97316",
                                    fillOpacity: 0.25,
                                    weight: 2,
                                }}
                            >
                                <Popup>
                                    <div className="p-3 min-w-[200px] space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-sm leading-tight">{zone.name}</h3>
                                            <span
                                                className={cn(
                                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                                                    zone.riskLevel === "high"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-orange-100 text-orange-700"
                                                )}
                                            >
                                                {zone.riskLevel} risk
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-snug">{zone.description}</p>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}

                        {/* Render Police Stations */}
                        {allPoliceStations.map((station) => (
                            <Marker
                                key={`police-${station.id}`}
                                position={station.position as [number, number]}
                                icon={PoliceIcon}
                            >
                                <Popup>
                                    <div className="p-3 min-w-[190px] space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Siren className="h-4 w-4 text-blue-600" />
                                            <h3 className="font-semibold text-sm">{station.name}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Emergency: {station.contact}</p>
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 font-medium">Available</span>
                                            <span className="text-gray-500">{station.responseTime}</span>
                                        </div>
                                        <Button size="sm" className="w-full h-8 text-[11px]" variant="secondary">
                                            Call Station
                                        </Button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        <Marker position={position}>
                            <Popup>
                                <div className="p-2 space-y-1">
                                    <h3 className="font-semibold text-sm text-primary">Your Location</h3>
                                    <p className="text-xs text-muted-foreground">Guwahati, Assam</p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/5" />
                </CardContent>
            </Card>
        </div>
    );
};

export default Map;