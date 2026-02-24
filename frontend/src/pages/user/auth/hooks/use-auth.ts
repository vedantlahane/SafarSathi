import { useCallback, useMemo, useState } from "react";
import {
  biometricLoginOptions,
  biometricLoginVerify,
  biometricRegisterOptions,
  biometricRegisterVerify,
  confirmPasswordReset,
  loginTourist,
  registerTourist,
  requestPasswordReset,
} from "@/lib/api";
import { saveSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import { getItem, setItem } from "@/lib/utils/storage";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type { AuthMode, PasswordCheck, RegisterFormState, RegisterStep } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIOMETRIC_KEY = "yatrax:biometric-enabled";

function parseList(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function passwordCheck(password: string): PasswordCheck {
  return {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[A-Za-z]/.test(password),
  };
}

export function useAuth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [registerStep, setRegisterStep] = useState<RegisterStep>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    phone: "",
    nationality: "",
    passportNumber: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
  });

  const [pendingSession, setPendingSession] = useState<{
    touristId: string;
    token: string;
    name: string;
    email: string;
    idHash?: string;
    qrContent?: string;
  } | null>(null);

  const biometricSupported = typeof window !== "undefined" && "PublicKeyCredential" in window;
  const biometricEnabled = getItem<boolean>(BIOMETRIC_KEY, false);

  const passwordStatus = useMemo(
    () => passwordCheck(form.password),
    [form.password]
  );

  const canProceedStep1 = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!EMAIL_RE.test(form.email)) return false;
    return Object.values(passwordStatus).every(Boolean);
  }, [form.name, form.email, passwordStatus]);

  const canProceedStep2 = useMemo(() => {
    if (!form.nationality.trim()) return false;
    if (!form.phone.replace(/\D/g, "")) return false;
    if (!form.passportNumber.trim()) return false;
    return form.phone.replace(/\D/g, "").length >= 8;
  }, [form.nationality, form.phone, form.passportNumber]);

  const canProceedStep3 = useMemo(() => {
    return form.emergencyPhone.replace(/\D/g, "").length >= 8;
  }, [form.emergencyPhone]);

  const handleLogin = useCallback(async () => {
    if (!EMAIL_RE.test(loginEmail) || !loginPassword) {
      setMessage("Enter a valid email and password.");
      return;
    }

    setLoading(true);
    hapticFeedback("light");

    try {
      const result = await loginTourist({ email: loginEmail, password: loginPassword });
      saveSession({
        touristId: result.touristId,
        token: result.token,
        name: result.user.name,
        email: result.user.email,
        idHash: result.user.idHash,
      }, { persist: rememberMe });
      hapticFeedback("medium");
      if (biometricSupported && !biometricEnabled) {
        setShowBiometricPrompt(true);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Login failed.");
      hapticFeedback("heavy");
    } finally {
      setLoading(false);
    }
  }, [loginEmail, loginPassword, rememberMe, biometricSupported, biometricEnabled]);

  const goToRegister = useCallback(() => {
    setMode("register");
    setRegisterStep(1);
    setMessage(null);
  }, []);

  const goToLogin = useCallback(() => {
    setMode("login");
    setMessage(null);
  }, []);

  const nextStep = useCallback(() => {
    if (registerStep === 1 && !canProceedStep1) {
      setMessage("Please complete name, email, and password requirements.");
      return;
    }
    if (registerStep === 2 && !canProceedStep2) {
      setMessage("Nationality is required. Phone must be valid if provided.");
      return;
    }
    if (registerStep === 3 && !canProceedStep3) {
      setMessage("Emergency contact phone is required.");
      return;
    }
    setRegisterStep((prev) => (prev === 3 ? 3 : ((prev + 1) as RegisterStep)));
    setMessage(null);
  }, [registerStep, canProceedStep1, canProceedStep2, canProceedStep3]);

  const prevStep = useCallback(() => {
    setRegisterStep((prev) => (prev === 1 ? 1 : ((prev - 1) as RegisterStep)));
  }, []);

  const submitRegister = useCallback(async () => {
    if (!canProceedStep3) {
      setMessage("Emergency contact phone is required.");
      return;
    }

    setLoading(true);
    hapticFeedback("light");

    try {
      const result = await registerTourist({
        name: form.name,
        email: form.email,
        phone: form.phone,
        passportNumber: form.passportNumber,
        nationality: form.nationality,
        passwordHash: form.password,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
        },
        bloodType: form.bloodType || undefined,
        allergies: parseList(form.allergies),
        medicalConditions: parseList(form.medicalConditions),
      });

      setPendingSession({
        touristId: result.touristId,
        token: result.token,
        name: result.user.name,
        email: result.user.email,
        idHash: result.user.idHash,
        qrContent: result.qr_content,
      });

      setMode("success");
      hapticFeedback("medium");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed.");
      hapticFeedback("heavy");
    } finally {
      setLoading(false);
    }
  }, [form, canProceedStep3]);

  const completeRegistration = useCallback(() => {
    if (!pendingSession) return;
    saveSession({
      touristId: pendingSession.touristId,
      token: pendingSession.token,
      name: pendingSession.name,
      email: pendingSession.email,
      idHash: pendingSession.idHash,
    }, { persist: true });
  }, [pendingSession]);

  const requestReset = useCallback(async () => {
    const email = (loginEmail || "").trim();
    if (!EMAIL_RE.test(email)) {
      setMessage("Enter your account email to request a reset.");
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setMessage("Reset link sent. Check your email.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reset request failed.");
    } finally {
      setLoading(false);
    }
  }, [loginEmail]);

  const submitReset = useCallback(async () => {
    if (!resetToken || resetPassword.length < 8) {
      setMessage("Enter a valid token and a new password.");
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(resetToken, resetPassword);
      setMessage("Password updated. You can sign in now.");
      setShowReset(false);
      setResetToken("");
      setResetPassword("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }, [resetToken, resetPassword]);

  const enableBiometrics = useCallback(async () => {
    try {
      const options = await biometricRegisterOptions();
      const response = await startRegistration(options as any);
      await biometricRegisterVerify(response);
      setItem(BIOMETRIC_KEY, true);
      setShowBiometricPrompt(false);
      setMessage("Biometric login enabled.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Biometric setup failed.");
    }
  }, []);

  const biometricLogin = useCallback(async () => {
    const email = (loginEmail || "").trim();
    if (!EMAIL_RE.test(email)) {
      setMessage("Enter your email to use biometric login.");
      return;
    }
    setLoading(true);
    try {
      const { options, touristId } = await biometricLoginOptions(email);
      const response = await startAuthentication(options as any);
      const result = await biometricLoginVerify({ touristId, response });
      saveSession({
        touristId: result.touristId,
        token: result.token,
        name: result.user.name,
        email: result.user.email,
        idHash: result.user.idHash,
      }, { persist: rememberMe });
      hapticFeedback("medium");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Biometric login failed.");
    } finally {
      setLoading(false);
    }
  }, [loginEmail, rememberMe]);

  return {
    mode,
    registerStep,
    loading,
    message,
    showReset,
    setShowReset,
    rememberMe,
    setRememberMe,
    showBiometricPrompt,
    setShowBiometricPrompt,
    biometricSupported,
    biometricEnabled,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    resetToken,
    setResetToken,
    resetPassword,
    setResetPassword,
    form,
    setForm,
    passwordStatus,
    canProceedStep1,
    canProceedStep2,
    canProceedStep3,
    pendingSession,
    goToRegister,
    goToLogin,
    nextStep,
    prevStep,
    handleLogin,
    submitRegister,
    completeRegistration,
    requestReset,
    submitReset,
    enableBiometrics,
    biometricLogin,
  };
}
