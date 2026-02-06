import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  User,
  Mail,
  MapPin,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  Moon,
  HelpCircle,
  FileText,
  MessageSquare,
  ExternalLink,
  Lock,
  Sparkles,
  Phone,
  Globe,
  Settings2,
  Volume2,
  Vibrate,
  Info,
  Heart,
  Star,
  Award,
  Zap,
  ShieldCheck,
  KeyRound,
  Fingerprint,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { hapticFeedback } from "@/lib/store";
import {
  fetchTouristProfile,
  loginTourist,
  registerTourist,
  updateTouristProfile,
} from "@/lib/api";
import { clearSession, saveSession, useSession } from "@/lib/session";

const Settings = () => {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassport, setRegisterPassport] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileNationality, setProfileNationality] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Preferences
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!session?.touristId) return;
    const loadProfile = async () => {
      try {
        const profile = await fetchTouristProfile(session.touristId);
        setProfileName(profile.name ?? "");
        setProfilePhone(profile.phone ?? "");
        setProfileAddress(profile.address ?? "");
        setProfileNationality(profile.nationality ?? "");
        setProfileGender(profile.gender ?? "");
      } catch {
        /* ignore */
      }
    };
    loadProfile();
  }, [session?.touristId]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showMessage("error", "Please fill in all fields");
      return;
    }
    hapticFeedback("light");
    setLoading(true);
    try {
      const result = await loginTourist({ email: loginEmail, password: loginPassword });
      const profile = await fetchTouristProfile(result.touristId);
      saveSession({
        touristId: result.touristId,
        token: result.token,
        name: profile.name,
        email: profile.email,
        idHash: profile.idHash,
      });
      hapticFeedback("medium");
      showMessage("success", "Welcome back!");
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      hapticFeedback("heavy");
      showMessage("error", (err as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      showMessage("error", "Please fill in required fields");
      return;
    }
    hapticFeedback("light");
    setLoading(true);
    try {
      const result = await registerTourist({
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        passportNumber: registerPassport,
        passwordHash: registerPassword,
      });
      const profile = await fetchTouristProfile(result.touristId);
      saveSession({
        touristId: result.touristId,
        token: result.token,
        name: profile.name,
        email: profile.email,
        idHash: profile.idHash,
      });
      hapticFeedback("medium");
      showMessage("success", "Account created successfully!");
      setShowRegister(false);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPhone("");
      setRegisterPassport("");
      setRegisterPassword("");
    } catch (err) {
      hapticFeedback("heavy");
      showMessage("error", (err as Error).message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.touristId) return;
    hapticFeedback("light");
    setLoading(true);
    try {
      const payload = {
        ...(profileName && { name: profileName }),
        ...(profilePhone && { phone: profilePhone }),
        ...(profileAddress && { address: profileAddress }),
        ...(profileNationality && { nationality: profileNationality }),
        ...(profileGender && { gender: profileGender }),
      };
      const updated = await updateTouristProfile(session.touristId, payload);
      saveSession({
        ...session,
        name: updated.name,
        email: updated.email,
        idHash: updated.idHash,
      });
      hapticFeedback("medium");
      showMessage("success", "Profile updated");
      setShowProfileEdit(false);
    } catch (err) {
      hapticFeedback("heavy");
      showMessage("error", (err as Error).message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    hapticFeedback("medium");
    clearSession();
    setShowLogoutConfirm(false);
    showMessage("success", "Logged out successfully");
  };

  // Message Toast
  const MessageToast = () =>
    message ? (
      <div
        className={cn(
          "fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top",
          message.type === "success"
            ? "bg-emerald-500 text-white"
            : "bg-red-500 text-white"
        )}
      >
        {message.type === "success" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 shrink-0" />
        )}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
    ) : null;

  // Logged out view
  if (!session?.touristId) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <MessageToast />

        {/* Hero Section */}
        <div className="relative overflow-hidden px-6 pt-8 pb-12">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />

          <div className="relative text-center">
            <div className="relative inline-flex mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-2xl shadow-blue-500/30">
                <Shield className="h-12 w-12" />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg border">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">SafarSathi</h1>
            <p className="text-muted-foreground max-w-[280px] mx-auto">
              Your trusted companion for safe and secure travels
            </p>

            {/* Features */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 mx-auto mb-1">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-[10px] text-muted-foreground">Verified</p>
              </div>
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 mx-auto mb-1">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-[10px] text-muted-foreground">Fast SOS</p>
              </div>
              <div className="text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 mx-auto mb-1">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-[10px] text-muted-foreground">Trusted</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 pb-8 space-y-4">
          {/* Login Card */}
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                  <LogIn className="h-5 w-5 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="font-bold">Welcome Back</h2>
                  <p className="text-xs text-blue-100">Sign in to continue</p>
                </div>
              </div>
            </div>
            <CardContent className="p-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-11 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-11 h-12 rounded-xl border-slate-200"
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className="overflow-hidden border shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <button
                className="w-full p-5 flex items-center justify-between text-left"
                onClick={() => setShowRegister(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">New to SafarSathi?</p>
                    <p className="text-sm text-muted-foreground">Create your travel safety account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50">
              <Info className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700">
                Your data is protected with end-to-end encryption and blockchain verification
              </p>
            </div>
          </div>

          {/* Version */}
          <p className="text-center text-xs text-muted-foreground pt-4">
            SafarSathi v1.0.0
          </p>
        </div>

        {/* Register Sheet */}
        <Sheet open={showRegister} onOpenChange={setShowRegister}>
          <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl overflow-hidden">
            <SheetHeader className="pb-4">
              <SheetTitle className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                </div>
                Create Account
              </SheetTitle>
            </SheetHeader>

            <form onSubmit={handleRegister} className="mt-2 space-y-4 overflow-y-auto pb-8 h-full">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Passport Number</label>
                <div className="relative">
                  <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={registerPassport}
                    onChange={(e) => setRegisterPassport(e.target.value)}
                    placeholder="A1234567"
                    className="pl-11 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-11 pr-11 h-12 rounded-xl"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                By creating an account, you agree to our Terms of Service
              </p>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      <MessageToast />

      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 px-4 pt-6 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-10 left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-white/20 backdrop-blur border border-white/30">
            <span className="text-3xl font-bold text-white">
              {session.name?.charAt(0).toUpperCase() || "T"}
            </span>
          </div>
          <div className="flex-1 text-white">
            <p className="text-xl font-bold">{session.name || "Tourist"}</p>
            <p className="text-sm text-blue-100">{session.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Verified
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-[10px] backdrop-blur">
                <Star className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-14 space-y-4">
        {/* Edit Profile Card */}
        <Card className="overflow-hidden shadow-xl border-0">
          <CardContent className="p-0">
            <button
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              onClick={() => setShowProfileEdit(true)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Edit Profile</p>
                  <p className="text-xs text-muted-foreground">Update your personal information</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="px-4 py-3 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Preferences</h3>
              </div>
            </div>
            <div className="divide-y">
              <PreferenceRow
                icon={Bell}
                iconBg="bg-red-100"
                iconColor="text-red-600"
                label="Push Notifications"
                description="Receive safety alerts & updates"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
              <PreferenceRow
                icon={MapPin}
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                label="Location Sharing"
                description="Share location with authorities"
                checked={locationSharing}
                onCheckedChange={setLocationSharing}
              />
              <PreferenceRow
                icon={Vibrate}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                label="Haptic Feedback"
                description="Vibration on interactions"
                checked={haptics}
                onCheckedChange={setHaptics}
              />
              <PreferenceRow
                icon={Volume2}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                label="Sound Effects"
                description="Audio feedback for actions"
                checked={soundEffects}
                onCheckedChange={setSoundEffects}
              />
              <PreferenceRow
                icon={Moon}
                iconBg="bg-slate-100"
                iconColor="text-slate-600"
                label="Dark Mode"
                description="Coming soon"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="px-4 py-3 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Support & Info</h3>
              </div>
            </div>
            <div className="divide-y">
              <MenuRow icon={HelpCircle} iconBg="bg-amber-100" iconColor="text-amber-600" label="Help Center" />
              <MenuRow icon={MessageSquare} iconBg="bg-blue-100" iconColor="text-blue-600" label="Contact Support" />
              <MenuRow icon={FileText} iconBg="bg-slate-100" iconColor="text-slate-600" label="Terms of Service" />
              <MenuRow icon={Shield} iconBg="bg-emerald-100" iconColor="text-emerald-600" label="Privacy Policy" />
              <MenuRow icon={Star} iconBg="bg-purple-100" iconColor="text-purple-600" label="Rate SafarSathi" />
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold gap-2"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>

        {/* App Info */}
        <div className="text-center pt-2 pb-4 space-y-1">
          <p className="text-xs text-muted-foreground">
            SafarSathi v1.0.0
          </p>
          <p className="text-[10px] text-muted-foreground">
            Made with ❤️ for safe travels
          </p>
        </div>
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl overflow-hidden">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              Edit Profile
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleProfileUpdate} className="mt-2 space-y-4 overflow-y-auto pb-8">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Nationality</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={profileNationality}
                  onChange={(e) => setProfileNationality(e.target.value)}
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Gender</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={profileGender}
                  onChange={(e) => setProfileGender(e.target.value)}
                  placeholder="Male / Female / Other"
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="rounded-3xl max-w-[85vw] p-6">
          <DialogHeader>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4">
              <LogOut className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">Sign Out?</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to sign out of your SafarSathi account?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-semibold"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-12 rounded-xl font-semibold"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function PreferenceRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  icon: typeof Bell;
  iconBg: string;
  iconColor: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between p-4", disabled && "opacity-50")}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

function MenuRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
}: {
  icon: typeof HelpCircle;
  iconBg: string;
  iconColor: string;
  label: string;
}) {
  return (
    <button
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
      onClick={() => hapticFeedback("light")}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-slate-400" />
    </button>
  );
}

export default Settings;
