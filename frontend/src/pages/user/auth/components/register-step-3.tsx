import { HeartPulse, AlertTriangle, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  primaryPhone: string;
  sameAsPrimaryPhone: boolean;
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
  onToggleSameAsPrimaryPhone: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function RegisterStep3({
  emergencyName,
  emergencyPhone,
  primaryPhone,
  sameAsPrimaryPhone,
  bloodType,
  allergies,
  medicalConditions,
  canContinue,
  onChange,
  onToggleSameAsPrimaryPhone,
  onBack,
  onSubmit,
}: RegisterStep3Props) {
  const resolvedEmergencyPhone = sameAsPrimaryPhone ? primaryPhone : emergencyPhone;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="space-y-5 px-1" onSubmit={handleSubmit}>
      <div className="overflow-hidden rounded-[24px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">

        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 text-xs text-muted-foreground dark:border-white/10">
          <span>Emergency details (optional)</span>
          <div className="flex items-center gap-2">
            Use account phone
            <Switch checked={sameAsPrimaryPhone} onCheckedChange={onToggleSameAsPrimaryPhone} />
          </div>
        </div>

        {/* Em. Name Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <User className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Emergency Contact</label>
            <Input
              value={emergencyName}
              onChange={(e) => onChange("emergencyName", e.target.value)}
              placeholder="Full name"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Em. Phone Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <Phone className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Emergency Phone</label>
            <Input
              type="tel"
              inputMode="tel"
              value={resolvedEmergencyPhone}
              onChange={(e) => onChange("emergencyPhone", e.target.value)}
              placeholder="Phone number"
              disabled={sameAsPrimaryPhone}
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Blood Type Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex flex-col justify-center items-center font-bold text-primary group-focus-within:text-primary pt-2">
            <span className="text-[12px] opacity-70">ABO</span>
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2 pb-1 relative z-10">Blood Type</label>
            <Select value={bloodType} onValueChange={(value) => onChange("bloodType", value)}>
              <SelectTrigger className="h-6 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus:ring-0 rounded-none w-full flex align-center -mt-1">
                <SelectValue placeholder="Select type" />
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

        {/* Allergies Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <AlertTriangle className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Allergies</label>
            <Input
              value={allergies}
              onChange={(e) => onChange("allergies", e.target.value)}
              placeholder="e.g., peanuts, dust"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Medical Conditions Row */}
        <div className="relative flex items-center min-h-[64px] group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <HeartPulse className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Medical Conditions</label>
            <Input
              value={medicalConditions}
              onChange={(e) => onChange("medicalConditions", e.target.value)}
              placeholder="e.g., asthma, diabetes"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        If you add emergency contact details, include both name and phone.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-[52px] rounded-[20px] text-[15px] font-bold shadow-sm"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="h-[52px] rounded-[20px] text-[15px] font-bold shadow-[0_8px_16px_-4px_var(--theme-glow)] transition-all active:scale-[0.98]"
          disabled={!canContinue}
        >
          Create account
        </Button>
      </div>
    </form>
  );
}
