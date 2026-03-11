import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface EditAllergiesSheetProps {
  open: boolean;
  value: string;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
}

export function EditAllergiesSheet({
  open,
  value,
  loading,
  onOpenChange,
  onValueChange,
  onSave,
}: EditAllergiesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[45vh] rounded-[32px] border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_24px_48px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_24px_48px_rgba(0,0,0,0.6)] overflow-hidden">
        <SheetHeader className="pb-4">
          <SheetTitle>Allergies</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6 overflow-y-auto h-full">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold px-1 text-slate-500 dark:text-slate-400">List allergies</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/40 dark:border-white/10 transition-colors group-focus-within:border-primary/40 group-focus-within:bg-white/70 dark:group-focus-within:bg-slate-800/70" />
              <AlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary" />
              <Input
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder="e.g., peanuts, dust"
                className="pl-[42px] h-[52px] rounded-2xl bg-transparent border-none text-[15px] font-medium shadow-none focus-visible:ring-0 placeholder:text-slate-400/70"
              />
            </div>
            <p className="text-[11px] px-1 text-muted-foreground pt-1">Separate items with commas.</p>
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
