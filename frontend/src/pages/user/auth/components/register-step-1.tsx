import { Mail, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold">Full name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Full name"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            value={email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="you@email.com"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            value={password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Create a secure password"
            className="h-12 rounded-xl pl-11"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Password requirements</p>
        <ul className="mt-2 space-y-1">
          <li className={passwordStatus.minLength ? "text-emerald-500" : ""}>
            • At least 8 characters
          </li>
          <li className={passwordStatus.hasLetter ? "text-emerald-500" : ""}>
            • Includes a letter
          </li>
          <li className={passwordStatus.hasNumber ? "text-emerald-500" : ""}>
            • Includes a number
          </li>
        </ul>
      </div>

      <Button className="h-12 w-full rounded-xl" onClick={onNext} disabled={!canContinue}>
        Continue
      </Button>
    </div>
  );
}
