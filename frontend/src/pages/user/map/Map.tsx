import { useState, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import { Navigation, Shield, Phone, Clock, Route, Target, X, Car, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapticFeedback } from "@/lib/store";
import "leaflet/dist/leaflet.css";

import { useMapData } from "./hooks/use-map-data";
import { getZoneColor, type Destination } from "./types";
import { PoliceIcon, UserIcon, DestinationIcon } from "./components/map-icons";
import { MapControls } from "./components/map-controls";
import { SearchControl } from "./components/search-control";
import { StatsPill } from "./components/stats-pill";
import { LayersSheet } from "./components/layers-sheet";
import { DestinationBar, NearestStationBar } from "./components/bottom-cards";
import { MapSOSButton } from "./components/map-sos-button";
import { ZoneDialog } from "./components/zone-dialog";

const FlyToLocation = ({ position, zoom }: { position: [number, number] | null; zoom?: number }) => {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, zoom || map.getZoom(), { duration: 1 }); }, [position, zoom, map]);
  return null;
};

const Map = () => {
  const data = useMapData();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [layersOpen, setLayersOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<typeof data.zones[0] | null>(null);

  const handleSelectDestination = useCallback((name: string, lat: number, lng: number) => {
    setDestination({ name, lat, lng });
    if (data.userPosition) setRouteCoords([data.userPosition, [lat, lng]]);
  }, [data.userPosition]);

  const clearDestination = useCallback(() => { setDestination(null); setRouteCoords([]); }, []);

  const openInMaps = (lat: number, lng: number, name: string) => {
    hapticFeedback("light");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 flex flex-col">
      <div className="flex-1 relative">
        <MapContainer center={data.position} zoom={13} scrollWheelZoom zoomControl={false}
          style={{ height: "100%", width: "100%" }} className="z-0">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyToLocation position={data.flyTo} zoom={16} />
          <SearchControl onSelectDestination={handleSelectDestination} />
          <StatsPill zones={data.zones.length} stations={data.stations.length} userInZone={data.userInZone} onPress={() => setLayersOpen(true)} />
          <MapControls onLocate={data.handleLocate} locating={data.locating} />

          {data.zones.map((zone) => {
            const c = getZoneColor(zone.riskLevel);
            return <Circle key={`zone-${zone.id}`} center={[zone.centerLat, zone.centerLng]} radius={zone.radiusMeters}
              pathOptions={{ color: c.stroke, fillColor: c.fill, fillOpacity: 0.12, weight: 2 }}
              eventHandlers={{ click: () => setSelectedZone(zone) }} />;
          })}

          {data.stations.map((s) => (
            <Marker key={`police-${s.id}`} position={s.position} icon={PoliceIcon}>
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-blue-600" /><h3 className="font-bold text-sm">{s.name}</h3></div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Phone className="h-3 w-3" />{s.contact}</div>
                  {s.responseTime && <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3"><Clock className="h-3 w-3" />{s.responseTime}</div>}
                  <div className="flex gap-2">
                    <a href={`tel:${s.contact}`} className="flex-1"><Button size="sm" className="w-full h-8 text-xs gap-1"><Phone className="h-3 w-3" />Call</Button></a>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openInMaps(s.position[0], s.position[1], s.name)}><Route className="h-3 w-3" /></Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {data.userPosition && (
            <Marker position={data.userPosition} icon={UserIcon}>
              <Popup><div className="p-3 text-center">
                <div className="flex items-center gap-2 justify-center mb-2"><Navigation className="h-5 w-5 text-blue-600" /><span className="font-semibold">Your Location</span></div>
                <p className="text-xs text-muted-foreground">{data.userPosition[0].toFixed(5)}, {data.userPosition[1].toFixed(5)}</p>
              </div></Popup>
            </Marker>
          )}

          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={DestinationIcon}>
              <Popup><div className="p-3">
                <div className="flex items-center gap-2 mb-2"><Target className="h-5 w-5 text-emerald-600" /><span className="font-semibold text-sm">Destination</span></div>
                <p className="text-xs text-muted-foreground mb-3">{destination.name}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => openInMaps(destination.lat, destination.lng, destination.name)}><Car className="h-3 w-3" />Navigate</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={clearDestination}><X className="h-3 w-3" /></Button>
                </div>
              </div></Popup>
            </Marker>
          )}

          {routeCoords.length === 2 && <Polyline positions={routeCoords} pathOptions={{ color: "#3b82f6", weight: 4, dashArray: "10, 10", opacity: 0.7 }} />}
        </MapContainer>

        {destination ? <DestinationBar destination={destination} onClear={clearDestination} /> :
          data.nearestStation && <NearestStationBar station={data.nearestStation} />}

        <MapSOSButton userPosition={data.userPosition} fallbackPosition={data.position} />
        <div className="absolute bottom-4 right-4 z-[1000]"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 backdrop-blur shadow-xl"><Compass className="h-7 w-7 text-slate-600" /></div></div>
      </div>

      <LayersSheet open={layersOpen} onOpenChange={setLayersOpen} userInZone={data.userInZone}
        riskFilter={data.riskFilter} setRiskFilter={data.setRiskFilter}
        showLayers={data.showLayers} setShowLayers={data.setShowLayers} zoneCount={data.zones.length} />
      <ZoneDialog zone={selectedZone} onClose={() => setSelectedZone(null)} onFlyTo={(p) => data.setFlyTo(p)} />
    </div>
  );
};

export default Map;
