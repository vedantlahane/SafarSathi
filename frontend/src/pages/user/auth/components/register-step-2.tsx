import { Globe, Phone, Fingerprint } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/lib/constants/countries";

const NATIONALITY_UNSET = "__unset_nationality";

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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="space-y-5 px-1" onSubmit={handleSubmit}>
      <div className="overflow-hidden rounded-[24px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">

        {/* Nationality Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <Globe className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Nationality (optional)</label>
            <Select
              value={nationality || NATIONALITY_UNSET}
              onValueChange={(value) =>
                onChange("nationality", value === NATIONALITY_UNSET ? "" : value)
              }
            >
              <SelectTrigger className="h-8 w-full border-none bg-transparent px-0 py-0 text-[16px] font-medium shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent align="start" className="max-h-72">
                <SelectItem value={NATIONALITY_UNSET}>Prefer not to say</SelectItem>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Phone Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <Phone className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Phone Number</label>
            <Input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Passport Row */}
        <div className="relative flex items-center min-h-[64px] group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <Fingerprint className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Passport or National ID</label>
            <Input
              value={passportNumber}
              onChange={(e) => onChange("passportNumber", e.target.value)}
              placeholder="ID Number"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Phone and passport/ID are required for identity verification.
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
          Continue
        </Button>
      </div>
    </form>
  );
}
