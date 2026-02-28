import { useState } from "react";
import { Radio, AlertTriangle, Info, Send, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import type { BroadcastType } from "../types";

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (type: BroadcastType, message: string) => void;
  recipientCount?: number;
}

export function BroadcastDialog({
  open,
  onOpenChange,
  onSend,
  recipientCount = 0,
}: BroadcastDialogProps) {
  const [type, setType] = useState<BroadcastType>("all");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (type === "emergency" && !confirm("This will trigger emergency push notifications and SMS to all recipients. Continue?")) {
      return;
    }
    onSend(type, message);
    setMessage("");
    onOpenChange(false);
  };

  const typeInfo: Record<BroadcastType, { label: string; desc: string; icon: typeof Users }> = {
    all: { label: "All Tourists", desc: "Send to everyone", icon: Users },
    zone: { label: "Zone-based", desc: "Send to tourists in specific zones", icon: Radio },
    district: { label: "District-based", desc: "Send to tourists in a specific district", icon: MapPin },
    emergency: { label: "Emergency Alert", desc: "High priority broadcast", icon: AlertTriangle },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            Broadcast Message
          </DialogTitle>
          <DialogDescription>
            Send notifications to tourists in the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="broadcastType">Broadcast Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as BroadcastType)}>
              <SelectTrigger id="broadcastType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <info.icon className="w-4 h-4" />
                      <span>{info.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">{typeInfo[type].desc}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="broadcastMessage">Message</Label>
            <textarea
              id="broadcastMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Enter your broadcast message..."
              className="w-full min-h-[120px] px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
              required
            />
            <p className="text-xs text-slate-500 text-right">{message.length}/500</p>
          </div>

          {type === "emergency" && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Emergency alerts will trigger push notifications and SMS</span>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>This will be sent to approximately <strong>{recipientCount}</strong> recipients</span>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-1.5" />
              Send Broadcast
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
