import { Eye, EyeOff, Mail, Lock, KeyRound, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  loading: boolean;
  showReset: boolean;
  rememberMe: boolean;
  biometricSupported: boolean;
  biometricEnabled: boolean;
  resetToken: string;
  resetPassword: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onOpenReset: (open: boolean) => void;
  onResetRequest: () => void;
  onResetSubmit: () => void;
  onResetTokenChange: (value: string) => void;
  onResetPasswordChange: (value: string) => void;
  onRememberChange: (value: boolean) => void;
  onBiometricLogin: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({
  email,
  password,
  showPassword,
  loading,
  showReset,
  rememberMe,
  biometricSupported,
  biometricEnabled,
  resetToken,
  resetPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onOpenReset,
  onResetRequest,
  onResetSubmit,
  onResetTokenChange,
  onResetPasswordChange,
  onRememberChange,
  onBiometricLogin,
  onSwitchToRegister,
}: LoginFormProps) {
  return (
    <div className="px-4 pb-8">
      <div className="mt-6 space-y-5">

        {/* Grouped Input Block */}
        <div className="overflow-hidden rounded-[24px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">

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
                onChange={(e) => onEmailChange(e.target.value)}
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
            <div className="flex-1 flex flex-col justify-center h-full py-1 pr-12">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••••"
                className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
              />
            </div>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={onTogglePassword}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>

        </div>

        <div className="flex items-center justify-between">
          <button
            className="text-xs text-primary"
            onClick={() => onOpenReset(true)}
          >
            Forgot password?
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Remember me
            <Switch checked={rememberMe} onCheckedChange={onRememberChange} />
          </div>
        </div>

        <Button className="h-[52px] w-full rounded-[20px] text-[15px] font-bold shadow-[0_8px_16px_-4px_var(--theme-glow)] transition-all active:scale-[0.98]" onClick={onSubmit} disabled={loading}>
          <KeyRound className="mr-2 h-[18px] w-[18px]" />
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {biometricSupported && biometricEnabled && (
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl"
            onClick={onBiometricLogin}
            disabled={loading}
          >
            <Fingerprint className="mr-2 h-4 w-4" />
            Use biometric login
          </Button>
        )}

        <button
          className="w-full text-xs text-muted-foreground"
          onClick={onSwitchToRegister}
        >
          New here? Create an account
        </button>
      </div>

      <Sheet open={showReset} onOpenChange={onOpenReset}>
        <SheetContent side="bottom" className="h-[45vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Password reset</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <p className="text-xs text-muted-foreground">
              We will send reset instructions to your email.
            </p>
            <div className="mt-4">
              <Input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="you@email.com"
                className="h-12 rounded-xl"
              />
            </div>
            <Button className="mt-4 h-12 w-full rounded-xl" onClick={onResetRequest}>
              Send reset link
            </Button>

            <div className="mt-5 space-y-3">
              <Input
                value={resetToken}
                onChange={(e) => onResetTokenChange(e.target.value)}
                placeholder="Reset token"
                className="h-12 rounded-xl"
              />
              <Input
                type="password"
                value={resetPassword}
                onChange={(e) => onResetPasswordChange(e.target.value)}
                placeholder="New password"
                className="h-12 rounded-xl"
              />
              <Button className="h-12 w-full rounded-xl" onClick={onResetSubmit}>
                Update password
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
