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
      <SheetContent side="bottom" className="h-[45vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Blood type</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Select blood type</label>
            <div className="relative">
              <Droplets className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="h-12 w-full rounded-xl pl-11">
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="h-12 w-full rounded-xl"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
