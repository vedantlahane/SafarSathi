import { Globe, Phone, Fingerprint } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RegisterStep2Props {
  phone: string;
  nationality: string;
  passportNumber: string;
  canContinue: boolean;
  onChange: (field: "phone" | "nationality" | "passportNumber", value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function RegisterStep2({
  phone,
  nationality,
  passportNumber,
  canContinue,
  onChange,
  onNext,
  onBack,
}: RegisterStep2Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold">Nationality</label>
        <div className="relative">
          <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
            placeholder="Nationality"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Phone *</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Passport number *</label>
        <div className="relative">
          <Fingerprint className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={passportNumber}
            onChange={(e) => onChange("passportNumber", e.target.value)}
            placeholder="Passport number"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-12 rounded-xl" onClick={onBack}>
          Back
        </Button>
        <Button className="h-12 rounded-xl" onClick={onNext} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
