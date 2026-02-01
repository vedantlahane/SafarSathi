import { useEffect, useState } from "react";
import { Shield, MapPin } from "lucide-react";
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
import type { PoliceDepartment, PoliceFormData } from "../types";

interface PoliceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  police?: PoliceDepartment | null;
  onSave: (data: PoliceFormData) => void;
}

const defaultFormData: PoliceFormData = {
  name: "",
  code: "",
  contactNumber: "",
  email: "",
  address: "",
  latitude: 26.1445,
  longitude: 91.7362,
  isActive: true,
};

export function PoliceDialog({
  open,
  onOpenChange,
  police,
  onSave,
}: PoliceDialogProps) {
  const [formData, setFormData] = useState<PoliceFormData>(defaultFormData);

  useEffect(() => {
    if (police) {
      setFormData({
        name: police.name,
        code: police.code || "",
        contactNumber: police.contactNumber || "",
        email: police.email || "",
        address: police.address || "",
        latitude: police.latitude || 26.1445,
        longitude: police.longitude || 91.7362,
        isActive: police.isActive ?? true,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [police, open]);

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
            <Shield className="w-5 h-5 text-blue-600" />
            {police ? "Edit Police Station" : "Add Police Station"}
          </DialogTitle>
          <DialogDescription>
            {police ? "Update station details." : "Register a new police station in the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policeName">Station Name</Label>
                <Input
                  id="policeName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Guwahati Central PS"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policeCode">Station Code</Label>
                <Input
                  id="policeCode"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., GC-001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policeContact">Contact Number</Label>
                <Input
                  id="policeContact"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policeEmail">Email</Label>
                <Input
                  id="policeEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="station@police.gov.in"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="policeAddress">Address</Label>
              <Input
                id="policeAddress"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address of the station"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policeLat">Latitude</Label>
                <Input
                  id="policeLat"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policeLng">Longitude</Label>
                <Input
                  id="policeLng"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policeStatus">Status</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(val) => setFormData({ ...formData, isActive: val === "active" })}
                >
                  <SelectTrigger id="policeStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> On Duty
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400" /> Off Duty
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>Tip: Get coordinates from Google Maps for accuracy</span>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {police ? "Update Station" : "Add Station"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
