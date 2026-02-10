import { useEffect, useState } from "react";
import { MapPin, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { RiskZone, ZoneFormData } from "../types";

interface ZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: RiskZone | null;
  onSave: (data: ZoneFormData) => void;
  initialPosition?: { lat: number; lng: number } | null;
}

const defaultFormData: ZoneFormData = {
  name: "",
  description: "",
  severity: "medium",
  radius: "500",
  lat: "0",
  lng: "0",
  isActive: true,
};

export function ZoneDialog({
  open,
  onOpenChange,
  zone,
  onSave,
  initialPosition,
}: ZoneDialogProps) {
  const [formData, setFormData] = useState<ZoneFormData>(defaultFormData);

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name,
        description: zone.description || "",
        severity: zone.severity,
        radius: String(zone.radius),
        lat: String(zone.center.lat),
        lng: String(zone.center.lng),
        isActive: zone.isActive,
      });
    } else if (initialPosition) {
      setFormData({
        ...defaultFormData,
        lat: String(initialPosition.lat),
        lng: String(initialPosition.lng),
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [zone, initialPosition, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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

            <div className="space-y-2">
              <Label htmlFor="zoneDescription">Description</Label>
              <Input
                id="zoneDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the zone"
              />
            </div>

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
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Critical
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" /> High
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
                <Label htmlFor="zoneRadius">Radius (meters)</Label>
                <Input
                  id="zoneRadius"
                  type="number"
                  min={100}
                  max={10000}
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                  required
                />
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

            <div className="flex items-center gap-2">
              <Label htmlFor="zoneActive" className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="zoneActive"
                  className="rounded border-gray-300"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active Zone
              </Label>
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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {zone ? "Update Zone" : "Create Zone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
