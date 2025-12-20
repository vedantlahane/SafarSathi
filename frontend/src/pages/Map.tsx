import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { useState, useMemo } from 'react';
import { LocateFixed, Search, Siren, ShieldAlert } from "lucide-react";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Assam")}`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.flyTo([parseFloat(lat), parseFloat(lon)], 14);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md px-2">
            <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search location in Assam..."
                        className={cn(
                            "flex h-10 w-full rounded-full border border-input bg-background/95 backdrop-blur-sm px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg transition-all",
                            loading && "opacity-70"
                        )}
                    />
                </div>
                <Button 
                    type="submit" 
                    size="icon" 
                    className="rounded-full shrink-0 shadow-lg h-10 w-10"
                    disabled={loading}
                >
                    <Search className={cn("h-4 w-4", loading && "animate-pulse")} />
                </Button>
            </form>
        </div>
    );
};

const LocationButton = () => {
    const map = useMap();
    const handleLocate = () => {
        map.locate().on("locationfound", (e) => {
            map.flyTo(e.latlng, 15)
        });
    };

    return (
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-[1000]">
            <Button
                variant="outline"
                size="icon"
                onClick={handleLocate}
                className="h-12 w-12 rounded-full shadow-2xl bg-background/80 backdrop-blur-md border-2 hover:bg-accent transition-all active:scale-90"
                title="Find my location"
            >
                <LocateFixed className="h-6 w-6 text-primary" />
            </Button>
        </div>
    )
}

const Map = () => {
    const [position] = useState<[number, number]>([26.1445, 91.7362]);

    // Flatten police stations data
    const allPoliceStations = useMemo(() => {
        return Object.values(policeData.assamPoliceStations).flat();
    }, []);

    return (
        <div className="flex flex-col flex-1 w-full gap-4 min-h-0">
            {/* Header - only visible on medium screens and up */}
            <div className="hidden md:flex items-center justify-between px-2 shrink-0">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-primary" />
                        Safety Map
                    </h2>
                    <p className="text-sm text-muted-foreground">Real-time risk zones and police stations</p>
                </div>
            </div>

            <Card className="flex-1 w-full overflow-hidden border-2 p-0 relative shadow-xl min-h-[400px]">
                <MapContainer
                    center={position}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
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
                                color: zone.riskLevel === 'high' ? '#ef4444' : '#f97316',
                                fillColor: zone.riskLevel === 'high' ? '#ef4444' : '#f97316',
                                fillOpacity: 0.25,
                                weight: 2
                            }}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-base mb-1">{zone.name}</h3>
                                    <div className={cn(
                                        "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2",
                                        zone.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    )}>
                                        {zone.riskLevel} Risk
                                    </div>
                                    <p className="text-sm text-gray-600 leading-tight">{zone.description}</p>
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
                                <div className="p-2 min-w-[180px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Siren className="h-4 w-4 text-blue-600" />
                                        <h3 className="font-bold text-sm">{station.name}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">Emergency: {station.contact}</p>
                                    <div className="flex items-center justify-between text-[10px]">
                                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Available</span>
                                        <span className="text-gray-500">{station.responseTime}</span>
                                    </div>
                                    <Button size="sm" className="w-full mt-3 h-7 text-[10px]">
                                        Call Station
                                    </Button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <Marker position={position}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-primary text-sm">Your Location</h3>
                                <p className="text-xs text-muted-foreground">Guwahati, Assam</p>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </Card>
        </div>
    )
}

export default Map;