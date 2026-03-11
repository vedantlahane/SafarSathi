import { Shield, Pencil, Trash2, Phone, MapPin, Mail, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PoliceDepartment } from "../types";

interface PoliceCardProps {
  police: PoliceDepartment;
  onEdit: (police: PoliceDepartment) => void;
  onDelete: (police: PoliceDepartment) => void;
  onContact: (police: PoliceDepartment) => void;
}

export function PoliceCard({ police, onEdit, onDelete, onContact }: PoliceCardProps) {
  return (
    <div className="rounded-2xl border border-white/40 backdrop-blur-xl p-4 transition-all duration-200 hover:scale-[1.01]"
      style={{ background: 'rgba(255,255,255,0.45)', boxShadow: 'inset 0 0.5px 0 0 rgba(255,255,255,0.7), 0 1px 3px 0 rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl backdrop-blur-sm border ${police.isActive ? "bg-emerald-500/10 border-emerald-300/30" : "bg-slate-500/8 border-slate-200/30"}`}>
            <Shield className={`h-4 w-4 ${police.isActive ? "text-emerald-600" : "text-slate-400"}`} />
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${police.isActive ? "bg-emerald-500/12 text-emerald-700" : "bg-slate-500/10 text-slate-500"}`}>
            {police.isActive ? "On Duty" : "Off Duty"}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white/40 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 glass-elevated border-white/30 rounded-xl">
            <DropdownMenuItem onClick={() => onContact(police)}>
              <Phone className="h-4 w-4 mr-2" /> Contact
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(police)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(police)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h4 className="font-semibold text-slate-800 mb-0.5 truncate text-[13px]">{police.name}</h4>
      <p className="text-xs text-slate-500 mb-3 font-mono tracking-wide">{police.departmentCode}</p>
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{police.city}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{police.contactNumber || "No contact"}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">{police.email}</span>
        </div>
      </div>
    </div>
  );
}
