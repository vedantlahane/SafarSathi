import { AuthHeader } from "./components/auth-header";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { AuthSuccess } from "./components/auth-success";
import { useAuth } from "./hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REGISTER_STEPS: Array<{ step: 1 | 2 | 3; label: string }> = [
  { step: 1, label: "Account" },
  { step: 2, label: "Identity" },
  { step: 3, label: "Emergency & health" },
];

export default function Auth() {
  const a = useAuth();
  const isFormMode = a.mode === "login" || a.mode === "register";
  const isPositiveMessage =
    !!a.message &&
    /(sent|updated|enabled|ready|success|done)/i.test(a.message) &&
    !/(failed|invalid|error|required|enter)/i.test(a.message);

  return (
    <div className="min-h-screen px-4 pb-24 pt-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        {isFormMode && (
          <div className="glass-thin animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl border border-[color:var(--theme-card-border)] p-1.5">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/45 p-1 dark:bg-slate-900/45">
              <button
                type="button"
                className={cn(
                  "h-10 rounded-xl text-sm font-semibold transition-all",
                  a.mode === "login"
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_var(--theme-glow)]"
                    : "text-slate-600 hover:bg-white/75 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                )}
                onClick={a.goToLogin}
              >
                Sign in
              </button>
              <button
                type="button"
                className={cn(
                  "h-10 rounded-xl text-sm font-semibold transition-all",
                  a.mode === "register"
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_var(--theme-glow)]"
                    : "text-slate-600 hover:bg-white/75 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                )}
                onClick={a.goToRegister}
              >
                Create account
              </button>
            </div>
          </div>
        )}

        <div className="glass-card animate-in fade-in duration-300 rounded-[28px] border border-white/50">
          {a.mode === "login" && (
            <>
              <AuthHeader title="Sign in" subtitle="Access your safety profile" />
              <LoginForm
                email={a.loginEmail}
                password={a.loginPassword}
                showPassword={a.showLoginPassword}
                loading={a.loading}
                showReset={a.showReset}
                rememberMe={a.rememberMe}
                biometricSupported={a.biometricSupported}
                biometricEnabled={a.biometricEnabled}
                resetToken={a.resetToken}
                resetPassword={a.resetPassword}
                onEmailChange={a.setLoginEmail}
                onPasswordChange={a.setLoginPassword}
                onTogglePassword={() => a.setShowLoginPassword(!a.showLoginPassword)}
                onSubmit={a.handleLogin}
                onOpenReset={a.setShowReset}
                onResetRequest={a.requestReset}
                onResetSubmit={a.submitReset}
                onResetTokenChange={a.setResetToken}
                onResetPasswordChange={a.setResetPassword}
                onRememberChange={a.setRememberMe}
                onBiometricLogin={a.biometricLogin}
                onSwitchToRegister={a.goToRegister}
              />
            </>
          )}

          {a.mode === "register" && (
            <>
              <AuthHeader title="Create account" subtitle="Build your safety profile" />
              <div className="px-5 pb-2">
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {REGISTER_STEPS.map((item) => (
                    <div key={item.step} className="space-y-1">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-colors",
                          a.registerStep >= item.step ? "bg-primary" : "bg-muted"
                        )}
                      />
                      <p
                        className={cn(
                          "text-[10px] font-medium",
                          a.registerStep >= item.step ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-8">
                <div className="mt-2 space-y-4">
                  <RegisterForm
                    step={a.registerStep}
                    name={a.form.name}
                    email={a.form.email}
                    password={a.form.password}
                    phone={a.form.phone}
                    nationality={a.form.nationality}
                    passportNumber={a.form.passportNumber}
                    emergencyName={a.form.emergencyName}
                    emergencyPhone={a.form.emergencyPhone}
                    primaryPhone={a.form.phone}
                    sameAsPrimaryPhone={a.sameAsPrimaryPhone}
                    bloodType={a.form.bloodType}
                    allergies={a.form.allergies}
                    medicalConditions={a.form.medicalConditions}
                    passwordStatus={a.passwordStatus}
                    canProceedStep1={a.canProceedStep1}
                    canProceedStep2={a.canProceedStep2}
                    canProceedStep3={a.canProceedStep3}
                    onChange={(field, value) => a.setForm({ ...a.form, [field]: value })}
                    onToggleSameAsPrimaryPhone={a.setSameAsPrimaryPhone}
                    onNext={a.registerStep === 3 ? a.submitRegister : a.nextStep}
                    onBack={a.prevStep}
                    onSubmit={a.submitRegister}
                  />

                  <button
                    type="button"
                    className="w-full text-xs text-muted-foreground"
                    onClick={a.goToLogin}
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            </>
          )}

          {a.mode === "success" && a.pendingSession && (
            <>
              <AuthHeader title="Account ready" subtitle="Your ID is active" />
              <AuthSuccess
                name={a.pendingSession.name}
                touristId={a.pendingSession.touristId}
                qrContent={a.pendingSession.qrContent}
                onContinue={a.completeRegistration}
              />
            </>
          )}

          {a.message && (
            <div className="px-6 pb-6">
              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-xs",
                  isPositiveMessage
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                {a.message}
              </div>
            </div>
          )}
        </div>
      </div>

      <Sheet open={a.showBiometricPrompt} onOpenChange={a.setShowBiometricPrompt}>
        <SheetContent side="bottom" className="h-[40vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Enable biometric login?</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-6">
            <p className="text-xs text-muted-foreground">
              Use Face ID, Touch ID, or device biometrics to sign in faster.
            </p>
            <Button className="h-12 w-full rounded-xl" onClick={a.enableBiometrics}>
              Enable biometrics
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl"
              onClick={() => a.setShowBiometricPrompt(false)}
            >
              Not now
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
