import { useState } from "react";
import { Settings, Bell, Shield, Database, Globe, Save } from "lucide-react";
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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (settings: SettingsData) => void;
}

interface SettingsData {
  alertThreshold: number;
  refreshInterval: number;
  enableNotifications: boolean;
  defaultZoom: number;
  language: string;
}

export function SettingsDialog({ open, onOpenChange, onSave }: SettingsDialogProps) {
  const [settings, setSettings] = useState<SettingsData>({
    alertThreshold: 5,
    refreshInterval: 30,
    enableNotifications: true,
    defaultZoom: 12,
    language: "en",
  });

  const handleSave = () => {
    onSave?.(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            System Settings
          </DialogTitle>
          <DialogDescription>
            Configure system preferences and defaults.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Notifications */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h4>
            <div className="grid gap-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="alertThreshold" className="text-sm">Alert Threshold</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  min={1}
                  max={20}
                  value={settings.alertThreshold}
                  onChange={(e) => setSettings({ ...settings, alertThreshold: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="refreshInterval" className="text-sm">Refresh Interval (sec)</Label>
                <Input
                  id="refreshInterval"
                  type="number"
                  min={10}
                  max={120}
                  value={settings.refreshInterval}
                  onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* Map Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Map Settings
            </h4>
            <div className="grid gap-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="defaultZoom" className="text-sm">Default Zoom Level</Label>
                <Input
                  id="defaultZoom"
                  type="number"
                  min={8}
                  max={18}
                  value={settings.defaultZoom}
                  onChange={(e) => setSettings({ ...settings, defaultZoom: Number(e.target.value) })}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* System */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Database className="w-4 h-4" /> System
            </h4>
            <div className="grid gap-3 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="language" className="text-sm">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(v) => setSettings({ ...settings, language: v })}
                >
                  <SelectTrigger id="language" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="as">Assamese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-1.5" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
