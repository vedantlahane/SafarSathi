import { PhoneCall, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface EditEmergencyContactSheetProps {
  open: boolean;
  name: string;
  phone: string;
  loading: boolean;
  canSave: boolean;
  onOpenChange: (open: boolean) => void;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSave: () => void;
}

export function EditEmergencyContactSheet({
  open,
  name,
  phone,
  loading,
  canSave,
  onOpenChange,
  onNameChange,
  onPhoneChange,
  onSave,
}: EditEmergencyContactSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[55vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle>Emergency contact</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold">Contact name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Full name"
                className="h-12 rounded-xl pl-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold">Phone number</label>
            <div className="relative">
              <PhoneCall className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                placeholder="Emergency phone"
                className="h-12 rounded-xl pl-11"
              />
            </div>
          </div>
          <Button
            className="h-12 w-full rounded-xl"
            onClick={onSave}
            disabled={!canSave || loading}
          >
            {loading ? "Saving..." : "Save contact"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
