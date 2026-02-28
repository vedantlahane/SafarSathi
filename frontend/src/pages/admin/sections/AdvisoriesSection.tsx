import { useMemo, useState, useCallback } from "react";
import {
  FileWarning,
  Plus,
  Search,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
  Pencil,
  RefreshCw,
  Calendar,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import type { TravelAdvisoryAdmin, AdvisoryFormData } from "../types";

interface AdvisoriesSectionProps {
  advisories: TravelAdvisoryAdmin[];
  isLoading: boolean;
  onSave: (formData: AdvisoryFormData, editingId?: string) => Promise<boolean>;
  onDelete: (advisory: TravelAdvisoryAdmin) => void;
  onRefresh: () => void;
}

const EMPTY_FORM: AdvisoryFormData = {
  title: "",
  description: "",
  severity: "info",
  region: "",
  expiresAt: "",
  affectedDistricts: "",
};

const SEVERITY_CONFIG = {
  info: { icon: Info, color: "bg-blue-100 text-blue-700", badge: "default" as const },
  warning: { icon: AlertTriangle, color: "bg-amber-100 text-amber-700", badge: "secondary" as const },
  critical: { icon: ShieldAlert, color: "bg-red-100 text-red-700", badge: "destructive" as const },
};

export function AdvisoriesSection({
  advisories,
  isLoading,
  onSave,
  onDelete,
  onRefresh,
}: AdvisoriesSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TravelAdvisoryAdmin | null>(null);
  const [form, setForm] = useState<AdvisoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return advisories.filter((a) => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.region.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;
      if (filter === "active") matchesFilter = a.isActive;
      else if (filter === "info") matchesFilter = a.severity === "info";
      else if (filter === "warning") matchesFilter = a.severity === "warning";
      else if (filter === "critical") matchesFilter = a.severity === "critical";

      return matchesSearch && matchesFilter;
    });
  }, [advisories, search, filter]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((a: TravelAdvisoryAdmin) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description,
      severity: a.severity,
      region: a.region,
      expiresAt: a.expiresAt ?? "",
      affectedDistricts: a.affectedDistricts?.join(", ") ?? "",
    });
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const ok = await onSave(form, editing?.id);
    setSaving(false);
    if (ok) setDialogOpen(false);
  }, [form, editing, onSave]);

  const activeCount = advisories.filter((a) => a.isActive).length;
  const criticalCount = advisories.filter((a) => a.severity === "critical").length;

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100/70 backdrop-blur-sm flex items-center justify-center">
              <FileWarning className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{advisories.length}</div>
              <div className="text-xs text-muted-foreground">Total Advisories</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100/70 backdrop-blur-sm flex items-center justify-center">
              <Info className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeCount}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100/70 backdrop-blur-sm flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{criticalCount}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search advisories..."
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" />
            New Advisory
          </Button>
        </div>
      </div>

      {/* Advisory List */}
      <ScrollArea className="h-[calc(100vh-22rem)]">
        <div className="grid gap-3">
          {filtered.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No advisories found
              </CardContent>
            </Card>
          )}
          {filtered.map((a) => {
            const cfg = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.info;
            const SeverityIcon = cfg.icon;

            return (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 rounded-lg ${cfg.color} flex items-center justify-center shrink-0`}>
                        <SeverityIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{a.title}</h3>
                          <Badge variant={cfg.badge} className="text-[10px] capitalize">{a.severity}</Badge>
                          {!a.isActive && (
                            <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{a.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {a.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Issued {new Date(a.issuedAt).toLocaleDateString()}
                          </span>
                          {a.expiresAt && (
                            <span className="flex items-center gap-1">
                              Expires {new Date(a.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {a.affectedDistricts && a.affectedDistricts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {a.affectedDistricts.map((d) => (
                              <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(a)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Advisory" : "New Advisory"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                rows={3}
                maxLength={500}
                placeholder="Describe the advisory..."
              />
              <p className="text-xs text-muted-foreground text-right">{form.description.length}/500</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as AdvisoryFormData["severity"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Region</Label>
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Assam" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Affected Districts (comma-separated)</Label>
              <Input
                value={form.affectedDistricts}
                onChange={(e) => setForm({ ...form, affectedDistricts: e.target.value })}
                placeholder="Kamrup, Nagaon, Dibrugarh"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.description || !form.region}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
