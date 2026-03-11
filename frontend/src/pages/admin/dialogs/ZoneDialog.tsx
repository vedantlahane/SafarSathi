import { useEffect, useState } from "react";
import { MapPin, Info, Shield, Zap, Pentagon, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { RiskZone, ZoneFormData } from "../types";

interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: RiskZone | null;
  onSave: (data: ZoneFormData) => void;
  initialPosition?: { lat: number; lng: number } | null;
  polygonCoordinates?: [number, number][];
  drawMode?: "circle" | "polygon";
}

const defaultFormData: ZoneFormData = {
  name: "",
  description: "",
  severity: "medium",
  category: "",
  shape: "circle",
  radius: "500",
  lat: "0",
  lng: "0",
  polygonCoordinates: [],
  isActive: true,
  expiresAt: "",
};

const categoryOptions = [
  { value: "flood", label: "Flood Zone", icon: "🌊" },
  { value: "wildlife", label: "Wildlife Hazard", icon: "🐾" },
  { value: "crime", label: "High Crime Area", icon: "⚠️" },
  { value: "traffic", label: "Traffic Hazard", icon: "🚗" },
  { value: "political_unrest", label: "Political Unrest", icon: "🚨" },
  { value: "other", label: "Other / General", icon: "⛔" },
];

const severityDescriptions: Record<string, string> = {
  critical: "Extremely dangerous. Tourists should avoid this area completely.",
  high: "Significant danger. Exercise extreme caution and consider alternatives.",
  medium: "Moderate risk. Stay alert and follow safety precautions.",
  low: "Minor risk. General awareness is sufficient.",
};

export function ZoneDialog({
  open,
  onOpenChange,
  zone,
  onSave,
  initialPosition,
  polygonCoordinates: initialPolygon,
  drawMode = "circle",
}: ZoneDialogProps) {
  const [formData, setFormData] = useState<ZoneFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name,
        description: zone.description || "",
        severity: zone.severity,
        category: (zone.category as ZoneFormData["category"]) || "",
        shape: zone.shape || "circle",
        radius: String(zone.radius),
        lat: String(zone.center.lat),
        lng: String(zone.center.lng),
        polygonCoordinates: zone.polygonCoordinates || [],
        isActive: zone.isActive,
        expiresAt: zone.expiresAt ? zone.expiresAt.slice(0, 10) : "",
      });
    } else if (initialPosition || initialPolygon) {
      setFormData({
        ...defaultFormData,
        shape: drawMode,
        lat: initialPosition ? String(initialPosition.lat) : "0",
        lng: initialPosition ? String(initialPosition.lng) : "0",
        polygonCoordinates: initialPolygon || [],
      });
    } else {
      setFormData({ ...defaultFormData, shape: drawMode });
    }
  }, [zone, initialPosition, initialPolygon, drawMode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave(formData);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {zone ? "Edit Risk Zone" : "Create New Risk Zone"}
          </DialogTitle>
          <DialogDescription>
            {zone ? "Update the zone details below." : "Define a new restricted or risk zone on the map."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            {/* Zone Name */}
            <div className="space-y-2">
              <Label htmlFor="zoneName">Zone Name</Label>
              <Input
                id="zoneName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Wildlife Sanctuary Buffer"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="zoneDescription">Description</Label>
              <Input
                id="zoneDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the danger and precautions"
              />
            </div>

            <Separator />

            {/* Severity + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoneSeverity">Severity Level</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(val) => setFormData({ ...formData, severity: val as ZoneFormData["severity"] })}
                >
                  <SelectTrigger id="zoneSeverity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-300" /> Critical
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> High
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneCategory">Category</Label>
                <Select
                  value={formData.category || "other"}
                  onValueChange={(val) => setFormData({ ...formData, category: val as ZoneFormData["category"] })}
                >
                  <SelectTrigger id="zoneCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span> {cat.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Severity description hint */}
            {formData.severity && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                formData.severity === "critical" ? "bg-purple-50 text-purple-800 border border-purple-200" :
                formData.severity === "high" ? "bg-red-50 text-red-800 border border-red-200" :
                formData.severity === "medium" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}>
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{severityDescriptions[formData.severity]}</span>
              </div>
            )}

            <Separator />

            {/* Shape indicator */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-2">
                {formData.shape === "polygon" ? (
                  <Pentagon className="h-4 w-4 text-blue-500" />
                ) : (
                  <Target className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium">
                  {formData.shape === "polygon" ? "Polygon Zone" : "Circle Zone"}
                </span>
              </div>
              <span className="text-xs text-slate-500 ml-auto">
                {formData.shape === "polygon"
                  ? `${formData.polygonCoordinates.length} vertices`
                  : "center + radius"}
              </span>
            </div>

            {/* Circle-specific fields: Radius + coordinates */}
            {formData.shape !== "polygon" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoneRadius">Radius (meters)</Label>
                    <Input
                      id="zoneRadius"
                      type="number"
                      min={50}
                      max={50000}
                      value={formData.radius}
                      onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                      required
                    />
                    <p className="text-xs text-slate-500">
                      {Number(formData.radius) >= 1000
                        ? `${(Number(formData.radius) / 1000).toFixed(1)} km`
                        : `${formData.radius}m`}
                      {" coverage area"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zoneExpiry">Expiry Date (optional)</Label>
                    <Input
                      id="zoneExpiry"
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                    <p className="text-xs text-slate-500">
                      {formData.expiresAt ? "Zone will auto-deactivate" : "Permanent zone"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoneLat">Latitude</Label>
                    <Input
                      id="zoneLat"
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zoneLng">Longitude</Label>
                    <Input
                      id="zoneLng"
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Polygon-specific fields: vertex list + expiry */}
            {formData.shape === "polygon" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="zoneExpiry">Expiry Date (optional)</Label>
                  <Input
                    id="zoneExpiry"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  <p className="text-xs text-slate-500">
                    {formData.expiresAt ? "Zone will auto-deactivate" : "Permanent zone"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Polygon Vertices ({formData.polygonCoordinates.length})</Label>
                  <div className="max-h-40 overflow-y-auto rounded-lg border bg-slate-50/50 divide-y">
                    {formData.polygonCoordinates.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 text-center">
                        Draw points on the map to define the polygon
                      </p>
                    ) : (
                      formData.polygonCoordinates.map(([lat, lng], i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs">
                          <span className="font-mono text-slate-600">
                            {i + 1}. {lat.toFixed(5)}, {lng.toFixed(5)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.polygonCoordinates.filter((_, idx) => idx !== i);
                              setFormData({ ...formData, polygonCoordinates: updated });
                            }}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {formData.polygonCoordinates.length > 0 && formData.polygonCoordinates.length < 3 && (
                    <p className="text-xs text-amber-600">Need at least 3 points for a polygon</p>
                  )}
                </div>
              </>
            )}

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <Label htmlFor="zoneActive" className="cursor-pointer">Active Zone</Label>
              </div>
              <Switch
                id="zoneActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {initialPosition && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <Info className="w-4 h-4" />
                <span>Position selected from map click</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
              {saving ? "Saving..." : zone ? "Update Zone" : "Create Zone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
