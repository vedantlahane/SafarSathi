import { useMemo, useState, useCallback } from "react";
import {
  Hospital,
  Plus,
  Search,
  Ambulance,
  Bed,
  Stethoscope,
  MapPin,
  Phone,
  Trash2,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { HospitalAdmin, HospitalFormData } from "../types";

interface HospitalsSectionProps {
  hospitals: HospitalAdmin[];
  isLoading: boolean;
  onSave: (formData: HospitalFormData, editingId?: string) => Promise<boolean>;
  onDelete: (hospital: HospitalAdmin) => void;
  onRefresh: () => void;
}

const EMPTY_FORM: HospitalFormData = {
  name: "",
  contact: "",
  type: "hospital",
  emergency: true,
  lat: "",
  lng: "",
  tier: "district",
  specialties: "",
  bedCapacity: "",
  ambulanceAvailable: false,
};

export function HospitalsSection({
  hospitals,
  isLoading,
  onSave,
  onDelete,
  onRefresh,
}: HospitalsSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HospitalAdmin | null>(null);
  const [form, setForm] = useState<HospitalFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.contact.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === "emergency") matchesFilter = h.emergency;
      else if (filter === "ambulance") matchesFilter = h.ambulanceAvailable === true;
      else if (filter === "hospital") matchesFilter = h.type === "hospital";
      else if (filter === "clinic") matchesFilter = h.type === "clinic";

      return matchesSearch && matchesFilter;
    });
  }, [hospitals, search, filter]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((h: HospitalAdmin) => {
    setEditing(h);
    setForm({
      name: h.name,
      contact: h.contact,
      type: h.type,
      emergency: h.emergency,
      lat: String(h.location.lat),
      lng: String(h.location.lng),
      tier: h.tier || "district",
      specialties: h.specialties?.join(", ") || "",
      bedCapacity: h.bedCapacity ? String(h.bedCapacity) : "",
      ambulanceAvailable: h.ambulanceAvailable ?? false,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const ok = await onSave(form, editing?.id);
    setSaving(false);
    if (ok) setDialogOpen(false);
  }, [form, editing, onSave]);

  const emergencyCount = hospitals.filter((h) => h.emergency).length;
  const totalBeds = hospitals.reduce((sum, h) => sum + (h.bedCapacity || 0), 0);
  const availBeds = hospitals.reduce((sum, h) => sum + (h.availableBeds || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-blue-200/40">
            <Hospital className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{hospitals.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Facilities</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-red-200/40">
            <Stethoscope className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{emergencyCount}</div>
            <div className="text-xs text-slate-500 font-medium">Emergency Ready</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-emerald-200/40">
            <Bed className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{availBeds}/{totalBeds}</div>
            <div className="text-xs text-slate-500 font-medium">Beds Available</div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-amber-200/40">
            <Ambulance className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {hospitals.filter((h) => h.ambulanceAvailable).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">With Ambulance</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-thin rounded-2xl px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border border-white/40">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals..."
              className="pl-10 bg-white/50 border-white/40 rounded-xl focus:bg-white/70"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36 bg-white/50 border-white/40 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="ambulance">Ambulance</SelectItem>
              <SelectItem value="hospital">Hospitals</SelectItem>
              <SelectItem value="clinic">Clinics</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="bg-white/50 border-white/40 rounded-xl hover:bg-white/70">
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openAdd} className="rounded-xl bg-blue-600/90 hover:bg-blue-600 backdrop-blur-sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Hospital
          </Button>
        </div>
      </div>

      {/* Hospital List */}
      <ScrollArea className="h-[calc(100vh-22rem)]">
        <div className="grid gap-3">
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
              No hospitals found
            </div>
          )}
          {filtered.map((h) => (
            <div key={h.id} className="glass-card rounded-2xl p-4 hover:bg-white/70 transition-all duration-200 border border-white/40">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate text-slate-900">{h.name}</h3>
                    {h.emergency && (
                      <Badge variant="destructive" className="text-[10px] bg-red-500/80 backdrop-blur-sm">Emergency</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] capitalize border-white/40 bg-white/30">{h.type}</Badge>
                    {h.tier && (
                      <Badge variant="secondary" className="text-[10px] capitalize bg-slate-100/60">{h.tier}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {h.contact}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {h.location.lat.toFixed(3)}, {h.location.lng.toFixed(3)}
                    </span>
                    {h.bedCapacity != null && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" /> {h.availableBeds ?? "?"}/{h.bedCapacity} beds
                      </span>
                    )}
                    {h.ambulanceAvailable && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Ambulance className="h-3 w-3" /> Ambulance
                      </span>
                    )}
                  </div>
                  {h.specialties && h.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {h.specialties.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px] border-white/40 bg-white/30">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50 rounded-lg" onClick={() => openEdit(h)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50/50 rounded-lg" onClick={() => onDelete(h)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md glass-elevated border-white/30 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Hospital" : "Add Hospital"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Contact</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as HospitalFormData["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Latitude</Label>
                <Input type="number" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Longitude</Label>
                <Input type="number" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Specialties (comma-separated)</Label>
              <Input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} placeholder="Trauma, Burns, General" />
            </div>
            <div className="grid gap-2">
              <Label>Bed Capacity</Label>
              <Input type="number" value={form.bedCapacity} onChange={(e) => setForm({ ...form, bedCapacity: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Emergency</Label>
              <Switch checked={form.emergency} onCheckedChange={(v) => setForm({ ...form, emergency: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ambulance Available</Label>
              <Switch checked={form.ambulanceAvailable} onCheckedChange={(v) => setForm({ ...form, ambulanceAvailable: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.contact || !form.lat || !form.lng}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
