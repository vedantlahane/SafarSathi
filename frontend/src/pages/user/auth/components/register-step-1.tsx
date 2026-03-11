import { Mail, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PasswordCheck } from "../types";

interface RegisterStep1Props {
  name: string;
  email: string;
  password: string;
  passwordStatus: PasswordCheck;
  canContinue: boolean;
  onChange: (field: "name" | "email" | "password", value: string) => void;
  onNext: () => void;
}

export function RegisterStep1({
  name,
  email,
  password,
  passwordStatus,
  canContinue,
  onChange,
  onNext,
}: RegisterStep1Props) {
  return (
    <div className="space-y-5 px-1">
      <div className="overflow-hidden rounded-[24px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">

        {/* Name Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <User className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Full Name</label>
            <Input
              value={name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="First Last"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Email Row */}
        <div className="relative flex items-center min-h-[64px] border-b border-black/5 dark:border-white/5 group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <Mail className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="you@email.com"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Password Row */}
        <div className="relative flex items-center min-h-[64px] group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40">
          <div className="w-[52px] flex justify-center items-center">
            <Lock className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Create secure password"
              className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-black/5 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 p-4 text-xs text-slate-500 dark:text-slate-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-none">
        <p className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px] mb-2">Requirements</p>
        <ul className="space-y-1.5 list-none">
          <li className={cn("flex items-center gap-2", passwordStatus.minLength ? "text-emerald-500 font-semibold" : "")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", passwordStatus.minLength ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")} /> At least 8 characters
          </li>
          <li className={cn("flex items-center gap-2", passwordStatus.hasLetter ? "text-emerald-500 font-semibold" : "")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", passwordStatus.hasLetter ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")} /> Includes a letter
          </li>
          <li className={cn("flex items-center gap-2", passwordStatus.hasNumber ? "text-emerald-500 font-semibold" : "")}>
            <div className={cn("w-1.5 h-1.5 rounded-full", passwordStatus.hasNumber ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")} /> Includes a number
          </li>
        </ul>
      </div>

      <Button className="h-[52px] w-full rounded-[20px] text-[15px] font-bold shadow-[0_8px_16px_-4px_var(--theme-glow)] transition-all active:scale-[0.98]" onClick={onNext} disabled={!canContinue}>
        Continue
      </Button>
    </div>
  );
}
