import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface EditBloodTypeSheetProps {
  open: boolean;
  value: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function EditBloodTypeSheet({
  open,
  value,
  loading,
  onOpenChange,
  onValueChange,
  onSave,
}: EditBloodTypeSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[45vh] rounded-[32px] border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_24px_48px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_24px_48px_rgba(0,0,0,0.6)] overflow-hidden">
        <SheetHeader className="pb-4">
          <SheetTitle>Blood type</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6 overflow-y-auto h-full">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold px-1 text-slate-500 dark:text-slate-400">Select blood type</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/40 dark:border-white/10 transition-colors group-focus-within:border-primary/40 group-focus-within:bg-white/70 dark:group-focus-within:bg-slate-800/70" />
              <Droplets className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary z-10" />
              <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="pl-[42px] h-[52px] rounded-2xl bg-transparent border-none text-[15px] font-medium shadow-none focus:ring-0">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="rounded-xl">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4">
            <Button className="w-full h-14 rounded-2xl font-semibold shadow-[0_8px_16px_-4px_var(--theme-glow)] transition-all active:scale-[0.98]" onClick={onSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
