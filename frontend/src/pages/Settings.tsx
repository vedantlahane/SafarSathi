import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { fetchTouristProfile, loginTourist, registerTourist, updateTouristProfile } from "@/lib/api";
import { clearSession, saveSession, useSession } from "@/lib/session";

const Settings = () => {
    const session = useSession();
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPhone, setRegisterPhone] = useState("");
    const [registerPassport, setRegisterPassport] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [authError, setAuthError] = useState<string | null>(null);
    const [authSuccess, setAuthSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profilePhone, setProfilePhone] = useState("");
    const [profileAddress, setProfileAddress] = useState("");
    const [profileNationality, setProfileNationality] = useState("");
    const [profileGender, setProfileGender] = useState("");

    useEffect(() => {
        if (!session?.touristId) {
            return;
        }
        const loadProfile = async () => {
            try {
                const profile = await fetchTouristProfile(session.touristId);
                setProfileName(profile.name ?? "");
                setProfilePhone(profile.phone ?? "");
                setProfileAddress(profile.address ?? "");
                setProfileNationality(profile.nationality ?? "");
                setProfileGender(profile.gender ?? "");
            } catch {
                // ignore
            }
        };
        loadProfile();
    }, [session?.touristId]);

    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setAuthError(null);
        setAuthSuccess(null);
        try {
            const result = await loginTourist({ email: loginEmail, password: loginPassword });
            const profile = await fetchTouristProfile(result.touristId);
            saveSession({
                touristId: result.touristId,
                token: result.token,
                name: profile.name,
                email: profile.email,
                idHash: profile.idHash
            });
            setAuthSuccess("Signed in successfully.");
        } catch (error) {
            setAuthError((error as Error).message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setAuthError(null);
        setAuthSuccess(null);
        try {
            const result = await registerTourist({
                name: registerName,
                email: registerEmail,
                phone: registerPhone,
                passportNumber: registerPassport,
                passwordHash: registerPassword
            });
            const profile = await fetchTouristProfile(result.touristId);
            saveSession({
                touristId: result.touristId,
                token: result.token,
                name: profile.name,
                email: profile.email,
                idHash: profile.idHash
            });
            setAuthSuccess("Account created and signed in.");
        } catch (error) {
            setAuthError((error as Error).message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (event: FormEvent) => {
        event.preventDefault();
        if (!session?.touristId) {
            return;
        }
        setLoading(true);
        setAuthError(null);
        setAuthSuccess(null);
        try {
            const payload = {
                ...(profileName ? { name: profileName } : {}),
                ...(profilePhone ? { phone: profilePhone } : {}),
                ...(profileAddress ? { address: profileAddress } : {}),
                ...(profileNationality ? { nationality: profileNationality } : {}),
                ...(profileGender ? { gender: profileGender } : {})
            };
            const updated = await updateTouristProfile(session.touristId, payload);
            saveSession({
                ...session,
                name: updated.name,
                email: updated.email,
                idHash: updated.idHash
            });
            setAuthSuccess("Profile updated.");
        } catch (error) {
            setAuthError((error as Error).message || "Profile update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3 text-[13px]">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Settings</CardTitle>
                    <CardDescription className="text-[12px]">Lightweight controls for the prototype.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-[12px] text-muted-foreground">
                    <p>Future items: offline cache status, simulation toggles, data export.</p>
                    <Button size="sm" variant="secondary" className="text-[12px]">
                        Download logs (coming soon)
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-[12px]"
                        onClick={() => {
                            window.location.hash = "#/admin";
                        }}
                    >
                        Open Admin Portal
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Account</CardTitle>
                    <CardDescription className="text-[12px]">Sign in or create your tourist profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-[12px] text-muted-foreground">
                    {session && (
                        <div className="space-y-2">
                            <p>
                                Signed in as <span className="font-semibold text-foreground">{session.name ?? session.email}</span>
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="text-[12px]"
                                onClick={() => clearSession()}
                            >
                                Sign out
                            </Button>
                        </div>
                    )}

                    {session && (
                        <form className="space-y-2" onSubmit={handleProfileUpdate}>
                            <div className="space-y-1">
                                <label className="text-[11px]">Name</label>
                                <input
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                    placeholder={session.name ?? "Your name"}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px]">Phone</label>
                                <input
                                    value={profilePhone}
                                    onChange={(e) => setProfilePhone(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                    placeholder="+91..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px]">Address</label>
                                <input
                                    value={profileAddress}
                                    onChange={(e) => setProfileAddress(e.target.value)}
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                    placeholder="Current address"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[11px]">Nationality</label>
                                    <input
                                        value={profileNationality}
                                        onChange={(e) => setProfileNationality(e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="Indian"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px]">Gender</label>
                                    <input
                                        value={profileGender}
                                        onChange={(e) => setProfileGender(e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="Male"
                                    />
                                </div>
                            </div>
                            <Button size="sm" className="text-[12px]" type="submit" disabled={loading}>
                                Update profile
                            </Button>
                        </form>
                    )}

                    {!session && (
                        <>
                            <form className="space-y-2" onSubmit={handleLogin}>
                                <div className="space-y-1">
                                    <label className="text-[11px]">Email</label>
                                    <input
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        type="email"
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px]">Password</label>
                                    <input
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        type="password"
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button size="sm" className="text-[12px]" type="submit" disabled={loading}>
                                    Sign in
                                </Button>
                            </form>

                            <div className="border-t border-border/60 pt-3" />

                            <form className="space-y-2" onSubmit={handleRegister}>
                                <div className="space-y-1">
                                    <label className="text-[11px]">Full name</label>
                                    <input
                                        value={registerName}
                                        onChange={(e) => setRegisterName(e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="Tourist name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px]">Email</label>
                                    <input
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        type="email"
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[11px]">Phone</label>
                                        <input
                                            value={registerPhone}
                                            onChange={(e) => setRegisterPhone(e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px]">Passport</label>
                                        <input
                                            value={registerPassport}
                                            onChange={(e) => setRegisterPassport(e.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                            placeholder="P123456"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px]">Password</label>
                                    <input
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        type="password"
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-[12px]"
                                        placeholder="Create a password"
                                    />
                                </div>
                                <Button size="sm" className="text-[12px]" type="submit" disabled={loading}>
                                    Create account
                                </Button>
                            </form>
                        </>
                    )}

                    {authSuccess && <div className="text-emerald-600">{authSuccess}</div>}
                    {authError && <div className="text-destructive">{authError}</div>}
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;