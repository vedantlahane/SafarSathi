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
      <SheetContent side="bottom" className="h-[45vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Allergies</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">List allergies</label>
            <div className="relative">
              <AlertTriangle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder="e.g., peanuts, dust"
                className="h-12 rounded-xl pl-11"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">Separate items with commas.</p>
          </div>
          <Button className="h-12 w-full rounded-xl" onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
