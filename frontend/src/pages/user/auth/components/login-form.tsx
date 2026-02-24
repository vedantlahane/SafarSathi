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
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="••••••••"
              className="h-12 rounded-xl pl-11 pr-11"
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={onTogglePassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

        <Button className="h-12 w-full rounded-xl" onClick={onSubmit} disabled={loading}>
          <KeyRound className="mr-2 h-4 w-4" />
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
