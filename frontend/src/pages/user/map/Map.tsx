import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from "react-leaflet";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Search,
  Siren,
  Shield,
  Loader2,
  Phone,
  MapPin,
  AlertTriangle,
  Navigation,
  Layers,
  X,
  CheckCircle2,
  Compass,
  Route,
  Clock,
  Target,
  ZoomIn,
  ZoomOut,
  LocateFixed,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Car,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";

import assamData from "../../../../../dataSets/assamRistrictedAreas.json";
import policeData from "../../../../../dataSets/assamPoliceStations.json";
import { fetchPoliceDepartments, fetchPublicRiskZones, postLocation, postSOS } from "@/lib/api";
import { useSession } from "@/lib/session";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Default Icon Setup
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Police Icon
const PoliceIcon = L.divIcon({
  html: `<div class="bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
         </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// User Location Icon
const UserIcon = L.divIcon({
  html: `<div class="relative">
          <div class="absolute -inset-3 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <div class="absolute -inset-1.5 bg-blue-400 rounded-full opacity-30"></div>
          <div class="relative bg-blue-600 p-2 rounded-full border-[3px] border-white shadow-xl">
            <div class="w-3 h-3 bg-white rounded-full"></div>
          </div>
         </div>`,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Destination Icon
const DestinationIcon = L.divIcon({
  html: `<div class="relative">
          <div class="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#10b981"/></svg>
          </div>
         </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Map Controls Component
const MapControls = ({ 
  onLocate, 
  locating 
}: { 
  onLocate: () => void; 
  locating: boolean;
}) => {
  const map = useMap();
  
  return (
    <div className="absolute bottom-32 right-4 z-[1000] flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => map.zoomIn()}
        className="h-11 w-11 rounded-xl shadow-lg bg-white/95 backdrop-blur border-0"
      >
        <ZoomIn className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={() => map.zoomOut()}
        className="h-11 w-11 rounded-xl shadow-lg bg-white/95 backdrop-blur border-0"
      >
        <ZoomOut className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        onClick={onLocate}
        disabled={locating}
        className="h-11 w-11 rounded-xl shadow-lg bg-white/95 backdrop-blur border-0"
      >
        {locating ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <LocateFixed className="h-5 w-5 text-primary" />
        )}
      </Button>
    </div>
  );
};

// Fly to location helper
const FlyToLocation = ({ position, zoom }: { position: [number, number] | null; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom || map.getZoom(), { duration: 1 });
    }
  }, [position, zoom, map]);
  return null;
};

// Search Component
const SearchControl = ({ 
  onSelectDestination 
}: { 
  onSelectDestination: (name: string, lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; lat: string; lon: string; type?: string }>>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Assam, India")}&limit=6&addressdetails=1`
      );
      const data = await response.json();
      setResults(data.map((d: { display_name: string; lat: string; lon: string; type?: string }) => ({
        name: d.display_name.split(",").slice(0, 3).join(", "),
        lat: d.lat,
        lon: d.lon,
        type: d.type,
      })));
      setShowResults(true);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const selectResult = (result: { name: string; lat: string; lon: string }) => {
    hapticFeedback("light");
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    map.flyTo([lat, lng], 15, { duration: 1.5 });
    onSelectDestination(result.name, lat, lng);
    setShowResults(false);
    setQuery("");
    setResults([]);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="absolute top-4 left-4 right-4 z-[1000]">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search places, landmarks..."
          className="pl-12 pr-12 h-14 rounded-2xl bg-white/95 backdrop-blur-lg shadow-xl border-0 text-base"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
        )}
        {query && !loading && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="mt-2 shadow-xl border-0 overflow-hidden rounded-2xl">
          <CardContent className="p-0 max-h-[300px] overflow-auto">
            {results.map((result, i) => (
              <button
                key={`search-${i}-${result.lat}-${result.lon}`}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left border-b last:border-0"
                onClick={() => selectResult(result)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{result.name}</p>
                  {result.type && (
                    <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                  )}
                </div>
                <ChevronUp className="h-4 w-4 text-muted-foreground rotate-90" />
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Stats Pill Component
const StatsPill = ({ 
  zones, 
  stations,
  userInZone,
  onPress 
}: { 
  zones: number; 
  stations: number;
  userInZone: boolean;
  onPress: () => void;
}) => (
  <button 
    onClick={onPress}
    className={cn(
      "absolute top-[76px] left-1/2 -translate-x-1/2 z-[1000]",
      "flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg",
      "bg-white/95 backdrop-blur-lg border border-slate-100",
      "transition-all active:scale-95",
      userInZone && "bg-red-50 border-red-200"
    )}
  >
    {userInZone && (
      <div className="flex items-center gap-1.5 text-red-600 pr-2 border-r border-red-200">
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs font-semibold">In Risk Zone</span>
      </div>
    )}
    <div className="flex items-center gap-1.5">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <span className="text-xs font-medium">{zones}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <Shield className="h-4 w-4 text-blue-500" />
      <span className="text-xs font-medium">{stations}</span>
    </div>
    <Layers className="h-4 w-4 text-muted-foreground" />
  </button>
);

const Map = () => {
  const session = useSession();
  const [position, setPosition] = useState<[number, number]>([26.1445, 91.7362]);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [backendZones, setBackendZones] = useState<
    Array<{
      id: number | string;
      name: string;
      description: string | null;
      centerLat: number;
      centerLng: number;
      radiusMeters: number;
      riskLevel: string | null;
    }>
  >([]);
  const [backendStations, setBackendStations] = useState<
    Array<{
      id: string | number;
      position: [number, number];
      name: string;
      contact: string;
      available: boolean;
      responseTime?: string;
    }>
  >([]);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [showLayers, setShowLayers] = useState({ zones: true, police: true });
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<typeof backendZones[0] | null>(null);
  const [userInZone, setUserInZone] = useState(false);
  const [nearestStation, setNearestStation] = useState<typeof backendStations[0] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  // Flatten police stations with unique keys
  const allPoliceStations = useMemo(() => {
    const stations: Array<{
      id: string | number;
      position: [number, number];
      name: string;
      contact: string;
      available: boolean;
      responseTime?: string;
    }> = [];
    Object.entries(policeData.assamPoliceStations).forEach(([district, districtStations]) => {
      districtStations.forEach((station, idx) => {
        stations.push({
          ...station,
          id: station.id ?? `${district}-${idx}`,
          position: station.position as [number, number],
        });
      });
    });
    return stations;
  }, []);

  // Fallback zones with guaranteed unique IDs
  const fallbackZones = useMemo(() => {
    return assamData.restrictedZones.map((zone, idx) => ({
      id: zone.id ?? `fallback-zone-${idx}`,
      name: zone.name,
      description: zone.description ?? null,
      centerLat: zone.position[0],
      centerLng: zone.position[1],
      radiusMeters: zone.radius,
      riskLevel: zone.riskLevel?.toUpperCase?.() ?? zone.riskLevel ?? "MEDIUM",
    }));
  }, []);

  // Filtered zones
  const zones = useMemo(() => {
    const sourceZones = backendZones.length > 0 ? backendZones : fallbackZones;
    return sourceZones
      .map((zone, idx) => ({
        ...zone,
        id: zone.id ?? `zone-${idx}`,
      }))
      .filter((zone) => {
        if (!showLayers.zones) return false;
        if (riskFilter === "all") return true;
        return zone.riskLevel?.toLowerCase() === riskFilter;
      });
  }, [backendZones, fallbackZones, showLayers.zones, riskFilter]);

  // Filtered stations with guaranteed unique IDs
  const stations = useMemo(() => {
    if (!showLayers.police) return [];
    const sourceStations = backendStations.length > 0 ? backendStations : allPoliceStations;
    return sourceStations.map((station, idx) => ({
      ...station,
      id: station.id ?? `station-${idx}`,
    }));
  }, [backendStations, allPoliceStations, showLayers.police]);

  // Check if user is in a risk zone
  useEffect(() => {
    if (!userPosition) {
      setUserInZone(false);
      return;
    }
    const inZone = zones.some((zone) => {
      const distance = L.latLng(userPosition).distanceTo(
        L.latLng(zone.centerLat, zone.centerLng)
      );
      return distance <= zone.radiusMeters;
    });
    setUserInZone(inZone);
  }, [userPosition, zones]);

  // Find nearest police station
  useEffect(() => {
    if (!userPosition || stations.length === 0) {
      setNearestStation(null);
      return;
    }
    let nearest = stations[0];
    let minDist = Infinity;
    stations.forEach((station) => {
      const dist = L.latLng(userPosition).distanceTo(L.latLng(station.position));
      if (dist < minDist) {
        minDist = dist;
        nearest = station;
      }
    });
    setNearestStation(nearest);
  }, [userPosition, stations]);

  // Load data
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [riskZones, policeDepts] = await Promise.all([
          fetchPublicRiskZones(),
          fetchPoliceDepartments(),
        ]);
        if (!active) return;
        setBackendZones(
          riskZones.map((zone, idx) => ({
            ...zone,
            id: zone.id ?? `backend-zone-${idx}`,
          }))
        );
        setBackendStations(
          policeDepts.map((dept, idx) => ({
            id: dept.id ?? `backend-station-${idx}`,
            position: [dept.latitude, dept.longitude] as [number, number],
            name: dept.name,
            contact: dept.contactNumber,
            available: dept.isActive ?? true,
          }))
        );
      } catch {
        // Use fallback data
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPosition(newPos);
          setPosition(newPos);
        },
        () => {
          // Use default position
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    
    hapticFeedback("light");
    setLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(newPos);
        setFlyTo(newPos);
        setLocating(false);
        
        // Update backend
        if (session?.touristId) {
          postLocation(session.touristId, { lat: newPos[0], lng: newPos[1] }).catch(() => {});
        }
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }, [session?.touristId]);

  const handleSelectDestination = useCallback((name: string, lat: number, lng: number) => {
    setDestination({ name, lat, lng });
    
    // Create simple route line if user position exists
    if (userPosition) {
      setRouteCoords([userPosition, [lat, lng]]);
    }
  }, [userPosition]);

  const clearDestination = useCallback(() => {
    setDestination(null);
    setRouteCoords([]);
  }, []);

  const handleSOS = async () => {
    if (!session?.touristId) return;
    hapticFeedback("heavy");
    setSosLoading(true);
    try {
      const loc = userPosition || position;
      await postSOS(session.touristId, { lat: loc[0], lng: loc[1] });
      setSosSuccess(true);
      hapticFeedback("heavy");
      setTimeout(() => setSosSuccess(false), 4000);
    } catch {
      // Silent fail
    } finally {
      setSosLoading(false);
    }
  };

  const getZoneColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case "high": return { stroke: "#dc2626", fill: "#dc2626" };
      case "medium": return { stroke: "#ea580c", fill: "#ea580c" };
      case "low": return { stroke: "#ca8a04", fill: "#ca8a04" };
      default: return { stroke: "#ea580c", fill: "#ea580c" };
    }
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    hapticFeedback("light");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Full Screen Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Fly to position */}
          <FlyToLocation position={flyTo} zoom={16} />

          {/* Search */}
          <SearchControl onSelectDestination={handleSelectDestination} />

          {/* Stats Pill */}
          <StatsPill 
            zones={zones.length} 
            stations={stations.length}
            userInZone={userInZone}
            onPress={() => setLayersOpen(true)}
          />

          {/* Map Controls */}
          <MapControls onLocate={handleLocate} locating={locating} />

          {/* Risk Zones */}
          {zones.map((zone) => {
            const colors = getZoneColor(zone.riskLevel);
            return (
              <Circle
                key={`zone-${zone.id}`}
                center={[zone.centerLat, zone.centerLng]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color: colors.stroke,
                  fillColor: colors.fill,
                  fillOpacity: 0.12,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedZone(zone),
                }}
              />
            );
          })}

          {/* Police Stations */}
          {stations.map((station) => (
            <Marker
              key={`police-${station.id}`}
              position={station.position}
              icon={PoliceIcon}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <h3 className="font-bold text-sm">{station.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Phone className="h-3 w-3" />
                    {station.contact}
                  </div>
                  {station.responseTime && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      {station.responseTime}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <a href={`tel:${station.contact}`} className="flex-1">
                      <Button size="sm" className="w-full h-8 text-xs gap-1">
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    </a>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => openInMaps(station.position[0], station.position[1], station.name)}
                    >
                      <Route className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location */}
          {userPosition && (
            <Marker position={userPosition} icon={UserIcon}>
              <Popup>
                <div className="p-3 text-center">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Navigation className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">Your Location</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userPosition[0].toFixed(5)}, {userPosition[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={DestinationIcon}>
              <Popup>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-sm">Destination</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{destination.name}</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 h-8 text-xs gap-1"
                      onClick={() => openInMaps(destination.lat, destination.lng, destination.name)}
                    >
                      <Car className="h-3 w-3" />
                      Navigate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={clearDestination}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {routeCoords.length === 2 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: "#3b82f6",
                weight: 4,
                dashArray: "10, 10",
                opacity: 0.7,
              }}
            />
          )}
        </MapContainer>

        {/* Destination Bar */}
        {destination && (
          <div className="absolute bottom-32 left-4 right-4 z-[1000]">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{destination.name}</p>
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
                <Button
                  size="sm"
                  className="h-9 gap-1.5 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => openInMaps(destination.lat, destination.lng, destination.name)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Navigate
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={clearDestination}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Nearest Station Quick Info */}
        {nearestStation && !destination && (
          <div className="absolute bottom-32 left-4 right-4 z-[1000]">
            <Card className="shadow-xl border-0 overflow-hidden bg-white/95 backdrop-blur">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Nearest Police Station</p>
                  <p className="text-sm font-medium truncate">{nearestStation.name}</p>
                </div>
                <a href={`tel:${nearestStation.contact}`}>
                  <Button size="sm" variant="outline" className="h-9 gap-1.5">
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SOS Button */}
        <Button
          variant="destructive"
          className={cn(
            "absolute bottom-4 left-4 z-[1000] h-14 rounded-2xl shadow-2xl gap-2 px-6",
            "bg-linear-to-r from-red-500 to-red-600",
            "transition-all",
            sosSuccess && "bg-linear-to-r from-emerald-500 to-emerald-600"
          )}
          onClick={handleSOS}
          disabled={!session?.touristId || sosLoading}
        >
          {sosLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : sosSuccess ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">SOS Sent!</span>
            </>
          ) : (
            <>
              <Siren className="h-5 w-5" />
              <span className="font-semibold">Emergency SOS</span>
            </>
          )}
        </Button>

        {/* Compass */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 backdrop-blur shadow-xl">
            <Compass className="h-7 w-7 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Layers Sheet */}
      <Sheet open={layersOpen} onOpenChange={setLayersOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[60vh] pb-8">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Map Layers & Filters
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 mt-6 pb-4">
            {/* Warning if in zone */}
            {userInZone && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">You're in a Risk Zone</p>
                  <p className="text-sm text-red-700 mt-1">
                    Stay alert and keep emergency contacts ready. Avoid isolated areas.
                  </p>
                </div>
              </div>
            )}
            
            {/* Risk Zone Filter */}
            <div>
              <p className="text-sm font-semibold mb-3 text-slate-700">Risk Level Filter</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "high", "medium", "low"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={riskFilter === level ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full capitalize h-10 px-4",
                      riskFilter === level && level === "high" && "bg-red-500 hover:bg-red-600",
                      riskFilter === level && level === "medium" && "bg-amber-500 hover:bg-amber-600",
                      riskFilter === level && level === "low" && "bg-yellow-500 hover:bg-yellow-600"
                    )}
                    onClick={() => {
                      hapticFeedback("light");
                      setRiskFilter(level);
                    }}
                  >
                    {level === "all" ? (
                      <>All Zones ({zones.length})</>
                    ) : (
                      <>{level} Risk</>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Layer Toggles */}
            <div>
              <p className="text-sm font-semibold mb-3 text-slate-700">Show on Map</p>
              <div className="flex gap-3">
                <Button
                  variant={showLayers.zones ? "default" : "outline"}
                  className={cn(
                    "flex-1 h-12 rounded-xl gap-2",
                    showLayers.zones && "bg-amber-500 hover:bg-amber-600"
                  )}
                  onClick={() => {
                    hapticFeedback("light");
                    setShowLayers((l) => ({ ...l, zones: !l.zones }));
                  }}
                >
                  <AlertTriangle className="h-5 w-5" />
                  Risk Zones
                </Button>
                <Button
                  variant={showLayers.police ? "default" : "outline"}
                  className={cn(
                    "flex-1 h-12 rounded-xl gap-2",
                    showLayers.police && "bg-blue-500 hover:bg-blue-600"
                  )}
                  onClick={() => {
                    hapticFeedback("light");
                    setShowLayers((l) => ({ ...l, police: !l.police }));
                  }}
                >
                  <Shield className="h-5 w-5" />
                  Police Stations
                </Button>
              </div>
            </div>

            {/* Map Legend */}
            <div>
              <p className="text-sm font-semibold mb-3 text-slate-700">Legend</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                  <div className="h-4 w-4 rounded-full bg-red-500 opacity-60" />
                  <span className="text-sm">High Risk Zone</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                  <div className="h-4 w-4 rounded-full bg-amber-500 opacity-60" />
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                  <div className="h-4 w-4 rounded-full bg-yellow-500 opacity-60" />
                  <span className="text-sm">Low Risk Zone</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Police Station</span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Zone Detail Dialog */}
      <Dialog open={!!selectedZone} onOpenChange={() => setSelectedZone(null)}>
        <DialogContent className="rounded-3xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "h-5 w-5",
                selectedZone?.riskLevel?.toLowerCase() === "high" && "text-red-500",
                selectedZone?.riskLevel?.toLowerCase() === "medium" && "text-amber-500",
                selectedZone?.riskLevel?.toLowerCase() === "low" && "text-yellow-500"
              )} />
              {selectedZone?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Badge
              className={cn(
                selectedZone?.riskLevel?.toLowerCase() === "high" && "bg-red-100 text-red-700",
                selectedZone?.riskLevel?.toLowerCase() === "medium" && "bg-amber-100 text-amber-700",
                selectedZone?.riskLevel?.toLowerCase() === "low" && "bg-yellow-100 text-yellow-700"
              )}
            >
              {selectedZone?.riskLevel || "Medium"} Risk Zone
            </Badge>
            
            <p className="text-sm text-muted-foreground">
              {selectedZone?.description || "Stay alert and exercise caution in this area."}
            </p>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Radius: {((selectedZone?.radiusMeters || 0) / 1000).toFixed(1)} km
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => {
                  if (selectedZone) {
                    setFlyTo([selectedZone.centerLat, selectedZone.centerLng]);
                  }
                  setSelectedZone(null);
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Map;
