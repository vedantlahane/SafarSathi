import { HeartPulse, AlertTriangle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegisterStep3Props {
  emergencyName: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  canContinue: boolean;
  onChange: (
    field:
      | "emergencyName"
      | "emergencyPhone"
      | "bloodType"
      | "allergies"
      | "medicalConditions",
    value: string
  ) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function RegisterStep3({
  emergencyName,
  emergencyPhone,
  bloodType,
  allergies,
  medicalConditions,
  canContinue,
  onChange,
  onBack,
  onSubmit,
}: RegisterStep3Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold">Emergency contact name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={emergencyName}
            onChange={(e) => onChange("emergencyName", e.target.value)}
            placeholder="Full name"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Emergency contact phone</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={emergencyPhone}
            onChange={(e) => onChange("emergencyPhone", e.target.value)}
            placeholder="Phone number"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Blood type</label>
        <Select
          value={bloodType}
          onValueChange={(value) => onChange("bloodType", value)}
        >
          <SelectTrigger className="h-12 w-full rounded-xl">
            <SelectValue placeholder="Select" />
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

      <div className="space-y-2">
        <label className="text-xs font-semibold">Allergies</label>
        <div className="relative">
          <AlertTriangle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={allergies}
            onChange={(e) => onChange("allergies", e.target.value)}
            placeholder="e.g., peanuts, dust"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Medical conditions</label>
        <div className="relative">
          <HeartPulse className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={medicalConditions}
            onChange={(e) => onChange("medicalConditions", e.target.value)}
            placeholder="e.g., asthma, diabetes"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-12 rounded-xl" onClick={onBack}>
          Back
        </Button>
        <Button className="h-12 rounded-xl" onClick={onSubmit} disabled={!canContinue}>
          Create account
        </Button>
      </div>
    </div>
  );
}
