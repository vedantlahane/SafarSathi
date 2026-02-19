import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { fetchTouristProfile, loginTourist, registerTourist, updateTouristProfile } from "@/lib/api";
import { clearSession, saveSession, useSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";

export function useSettings() {
    const session = useSession();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Register
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPhone, setRegisterPhone] = useState("");
    const [registerPassport, setRegisterPassport] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // Profile
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

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!session?.touristId) return;
        (async () => {
            try {
                const p = await fetchTouristProfile(session.touristId);
                setProfileName(p.name ?? ""); setProfilePhone(p.phone ?? "");
                setProfileAddress(p.address ?? ""); setProfileNationality(p.nationality ?? "");
                setProfileGender(p.gender ?? "");
            } catch { /* ignore */ }
        })();
    }, [session?.touristId]);

    const showMsg = useCallback((type: "success" | "error", text: string) => { setMessage({ type, text }); setTimeout(() => setMessage(null), 3000); }, []);

    const handleLogin = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) { showMsg("error", "Please fill in all fields"); return; }
        hapticFeedback("light"); setLoading(true);
        try {
            const r = await loginTourist({ email: loginEmail, password: loginPassword });
            const p = await fetchTouristProfile(r.touristId);
            saveSession({ touristId: r.touristId, token: r.token, name: p.name, email: p.email, idHash: p.idHash });
            hapticFeedback("medium"); showMsg("success", "Welcome back!"); setLoginEmail(""); setLoginPassword("");
        } catch (err) { hapticFeedback("heavy"); showMsg("error", (err as Error).message || "Login failed"); } finally { setLoading(false); }
    }, [loginEmail, loginPassword, showMsg]);

    const handleRegister = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!registerName || !registerEmail || !registerPassword) { showMsg("error", "Please fill in required fields"); return; }
        hapticFeedback("light"); setLoading(true);
        try {
            const r = await registerTourist({ name: registerName, email: registerEmail, phone: registerPhone, passportNumber: registerPassport, passwordHash: registerPassword });
            const p = await fetchTouristProfile(r.touristId);
            saveSession({ touristId: r.touristId, token: r.token, name: p.name, email: p.email, idHash: p.idHash });
            hapticFeedback("medium"); showMsg("success", "Account created!"); setShowRegister(false);
            setRegisterName(""); setRegisterEmail(""); setRegisterPhone(""); setRegisterPassport(""); setRegisterPassword("");
        } catch (err) { hapticFeedback("heavy"); showMsg("error", (err as Error).message || "Registration failed"); } finally { setLoading(false); }
    }, [registerName, registerEmail, registerPhone, registerPassport, registerPassword, showMsg]);

    const handleProfileUpdate = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!session?.touristId) return;
        hapticFeedback("light"); setLoading(true);
        try {
            const payload = {
                ...(profileName && { name: profileName }), ...(profilePhone && { phone: profilePhone }),
                ...(profileAddress && { address: profileAddress }), ...(profileNationality && { nationality: profileNationality }),
                ...(profileGender && { gender: profileGender })
            };
            const u = await updateTouristProfile(session.touristId, payload);
            saveSession({ ...session, name: u.name, email: u.email, idHash: u.idHash });
            hapticFeedback("medium"); showMsg("success", "Profile updated"); setShowProfileEdit(false);
        } catch (err) { hapticFeedback("heavy"); showMsg("error", (err as Error).message || "Update failed"); } finally { setLoading(false); }
    }, [session, profileName, profilePhone, profileAddress, profileNationality, profileGender, showMsg]);

    const handleLogout = useCallback(() => { hapticFeedback("medium"); clearSession(); setShowLogoutConfirm(false); showMsg("success", "Logged out"); }, [showMsg]);

    return {
        session, loading, message,
        loginEmail, setLoginEmail, loginPassword, setLoginPassword, showLoginPassword, setShowLoginPassword, handleLogin,
        registerName, setRegisterName, registerEmail, setRegisterEmail, registerPhone, setRegisterPhone,
        registerPassport, setRegisterPassport, registerPassword, setRegisterPassword,
        showRegisterPassword, setShowRegisterPassword, showRegister, setShowRegister, handleRegister,
        profileName, setProfileName, profilePhone, setProfilePhone, profileAddress, setProfileAddress,
        profileNationality, setProfileNationality, profileGender, setProfileGender, showProfileEdit, setShowProfileEdit, handleProfileUpdate,
        notifications, setNotifications, darkMode, setDarkMode, locationSharing, setLocationSharing,
        haptics, setHaptics, soundEffects, setSoundEffects,
        showLogoutConfirm, setShowLogoutConfirm, handleLogout,
    };
}
