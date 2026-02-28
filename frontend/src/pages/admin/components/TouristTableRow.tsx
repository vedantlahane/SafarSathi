import { Eye, Navigation, MessageSquare, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tourist } from "../types";

interface TouristTableRowProps {
  tourist: Tourist;
  onView: (tourist: Tourist) => void;
  onContact: (tourist: Tourist) => void;
  onTrack: (tourist: Tourist) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const riskColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export function TouristTableRow({ tourist, onView, onContact, onTrack, isSelected, onSelect }: TouristTableRowProps) {
  const riskLevel = tourist.riskScore > 70 ? "high" : tourist.riskScore > 40 ? "medium" : "low";

  return (
    <div className={`grid grid-cols-[40px_1fr_120px_100px_140px_120px_100px] gap-4 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
      <div className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(tourist.id)}
          className="rounded border-slate-300"
        />
      </div>
      <div className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {tourist.name?.charAt(0) || "T"}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${tourist.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">{tourist.name || "Unknown"}</p>
            <p className="text-xs text-slate-500">{tourist.email}</p>
          </div>
        </div>
      </div>
      <div className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tourist.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
          <Circle className={`h-1.5 w-1.5 fill-current ${tourist.isActive ? "text-emerald-500" : "text-slate-400"}`} />
          {tourist.isActive ? "Online" : "Offline"}
        </span>
      </div>
      <div className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[riskLevel]}`}>
          {tourist.riskScore}
        </span>
      </div>
      <div className="py-3 px-4 text-sm text-slate-500">{tourist.phoneNumber || "—"}</div>
      <div className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onView(tourist)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onTrack(tourist)}>
            <Navigation className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600" onClick={() => onContact(tourist)}>
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
