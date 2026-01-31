import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
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
        <div className="space-y-3 text-[13px]">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Digital ID</CardTitle>
                    <CardDescription className="text-[12px]">Your ID, verification link, and profile details.</CardDescription>
                </CardHeader>
                <CardContent className="text-[12px] text-muted-foreground">
                    {!session?.touristId && "Sign in to view your digital ID."}
                    {loading && "Loading profile…"}
                    {error && <span className="text-destructive">{error}</span>}
                    {profile && (
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold text-foreground">Tourist ID:</span> {profile.id}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Name:</span> {profile.name}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Passport:</span> {profile.passportNumber}
                            </div>
                            <div>
                                <span className="font-semibold text-foreground">Safety Score:</span> {profile.safetyScore ?? 100}
                            </div>
                            {profile.idExpiry && (
                                <div>
                                    <span className="font-semibold text-foreground">ID Expiry:</span> {profile.idExpiry}
                                </div>
                            )}
                            {verificationUrl && (
                                <div className="break-all">
                                    <span className="font-semibold text-foreground">Verify:</span> {verificationUrl}
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