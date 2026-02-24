import { AuthHeader } from "./components/auth-header";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { AuthSuccess } from "./components/auth-success";
import { useAuth } from "./hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const a = useAuth();

  return (
    <div className="min-h-screen pb-24">
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
          <div className="px-4 pb-8">
            <div className="mt-6 space-y-4">
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
                bloodType={a.form.bloodType}
                allergies={a.form.allergies}
                medicalConditions={a.form.medicalConditions}
                passwordStatus={a.passwordStatus}
                canProceedStep1={a.canProceedStep1}
                canProceedStep2={a.canProceedStep2}
                canProceedStep3={a.canProceedStep3}
                onChange={(field, value) => a.setForm({ ...a.form, [field]: value })}
                onNext={a.registerStep === 3 ? a.submitRegister : a.nextStep}
                onBack={a.prevStep}
                onSubmit={a.submitRegister}
              />

              <button
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

      <Sheet open={a.showBiometricPrompt} onOpenChange={a.setShowBiometricPrompt}>
        <SheetContent side="bottom" className="h-[40vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Enable biometric login?</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6 space-y-3">
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

      {a.message && (
        <div className="px-6 pb-6">
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-700">
            {a.message}
          </div>
        </div>
      )}
    </div>
  );
}
