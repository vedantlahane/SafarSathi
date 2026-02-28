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
    <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm p-4 hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${police.isActive ? "bg-emerald-100" : "bg-slate-100"}`}>
            <Shield className={`h-4 w-4 ${police.isActive ? "text-emerald-600" : "text-slate-400"}`} />
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${police.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {police.isActive ? "On Duty" : "Off Duty"}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
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
      <h4 className="font-semibold text-slate-900 mb-0.5 truncate">{police.name}</h4>
      <p className="text-xs text-slate-500 mb-3 font-mono">{police.departmentCode}</p>
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
