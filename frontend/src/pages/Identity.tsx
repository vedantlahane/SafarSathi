import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { QrCode, ShieldCheck } from "lucide-react";
import { fetchTouristProfile, getApiBaseUrl, type TouristProfile } from "@/lib/api";
import { useSession } from "@/lib/session";

const Identity = () => {
    const session = useSession();
    const [profile, setProfile] = useState<TouristProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!session?.touristId) {
            setProfile(null);
            return;
        }
        let active = true;
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await fetchTouristProfile(session.touristId);
                if (!active) {
                    return;
                }
                setProfile(data);
                setError(null);
            } catch (err) {
                if (!active) {
                    return;
                }
                setError((err as Error).message || "Unable to load profile.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };
        loadProfile();
        return () => {
            active = false;
        };
    }, [session?.touristId]);

    const verificationUrl = profile?.idHash
        ? `${getApiBaseUrl()}/api/admin/id/verify?hash=${profile.idHash}`
        : null;

    return (
        <div className="space-y-4 text-[13px]">
            <Card className="rounded-2xl border-none bg-gradient-to-br from-indigo-500 to-slate-900 text-white">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[11px] text-white/70">Digital ID</div>
                            <div className="text-lg font-semibold">Tourist Safety Pass</div>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                            <QrCode className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px]">
                        <ShieldCheck className="h-4 w-4 text-emerald-200" />
                        <span>Blockchain verified identity</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-none bg-white shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Profile</CardTitle>
                    <CardDescription className="text-[12px]">Your ID, verification link, and profile details.</CardDescription>
                </CardHeader>
                <CardContent className="text-[12px] text-muted-foreground">
                    {!session?.touristId && "Sign in to view your digital ID."}
                    {loading && "Loading profile…"}
                    {error && <span className="text-destructive">{error}</span>}
                    {profile && (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="text-[11px] text-slate-500">Tourist ID</div>
                                <div className="text-[12px] font-semibold text-slate-900 break-all">{profile.id}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 p-3">
                                    <div className="text-[11px] text-slate-500">Name</div>
                                    <div className="text-[12px] font-semibold text-slate-900">{profile.name}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3">
                                    <div className="text-[11px] text-slate-500">Passport</div>
                                    <div className="text-[12px] font-semibold text-slate-900">{profile.passportNumber}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 p-3">
                                    <div className="text-[11px] text-slate-500">Safety Score</div>
                                    <div className="text-[12px] font-semibold text-slate-900">{profile.safetyScore ?? 100}</div>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-3">
                                    <div className="text-[11px] text-slate-500">ID Expiry</div>
                                    <div className="text-[12px] font-semibold text-slate-900">{profile.idExpiry ?? "N/A"}</div>
                                </div>
                            </div>
                            {verificationUrl && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 break-all">
                                    <div className="text-[11px] text-slate-500">Verify URL</div>
                                    <div className="text-[12px] font-semibold text-slate-900">{verificationUrl}</div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Identity;