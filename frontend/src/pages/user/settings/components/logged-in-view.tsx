import { memo } from "react";
import { User, Phone, MapPin, Globe, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SettingsHeader } from "./settings-header";
import { SettingsGroup } from "./settings-group";
import { ThemeSelector } from "./theme-selector";
import { NotificationSettings } from "./notification-settings";
import { PrivacySettings } from "./privacy-settings";
import { EmergencyProfile } from "./emergency-profile";
import { AboutSection } from "./about-section";
import { DangerZone } from "./danger-zone";
import { MessageToast } from "./message-toast";
import type { useSettings } from "../hooks/use-settings";

type S = ReturnType<typeof useSettings>;

function LoggedInViewInner({ s }: { s: S }) {
    return (
        <div className="flex flex-col min-h-screen pb-24">
            <MessageToast message={s.message} />

            {/* Profile Header */}
            <SettingsHeader
                name={s.session?.name}
                email={s.session?.email}
                onEdit={() => s.setShowProfileEdit(true)}
            />

            <div className="px-4 space-y-6 mt-2">
                {/* Appearance */}
                <SettingsGroup heading="Appearance">
                    <div className="py-4">
                        <ThemeSelector />
                    </div>
                </SettingsGroup>

                {/* Notifications */}
                <SettingsGroup heading="Notifications">
                    <NotificationSettings
                        pushNotifications={s.pushNotifications}
                        setPushNotifications={s.setPushNotifications}
                        alertSounds={s.alertSounds}
                        setAlertSounds={s.setAlertSounds}
                        vibration={s.vibration}
                        setVibration={s.setVibration}
                        quietHours={s.quietHours}
                        setQuietHours={s.setQuietHours}
                    />
                </SettingsGroup>

                {/* Privacy */}
                <SettingsGroup heading="Privacy & Location">
                    <PrivacySettings
                        locationSharing={s.locationSharing}
                        setLocationSharing={s.setLocationSharing}
                        highAccuracyGps={s.highAccuracyGps}
                        setHighAccuracyGps={s.setHighAccuracyGps}
                        anonymousData={s.anonymousData}
                        setAnonymousData={s.setAnonymousData}
                    />
                </SettingsGroup>

                {/* Emergency Profile */}
                <SettingsGroup heading="Emergency Profile">
                    <EmergencyProfile
                        emergencyContact={s.emergencyContact}
                        bloodType={s.bloodType}
                        allergies={s.allergies}
                        medicalConditions={s.medicalConditions}
                    />
                </SettingsGroup>

                {/* About */}
                <SettingsGroup heading="About">
                    <AboutSection />
                </SettingsGroup>

                {/* Danger Zone */}
                <DangerZone onLogout={s.handleLogout} />

                <p className="text-center text-xs text-muted-foreground pb-4">
                    Made with ❤️ for safe travels
                </p>
            </div>

            {/* Edit Profile Sheet */}
            <Sheet open={s.showProfileEdit} onOpenChange={s.setShowProfileEdit}>
                <SheetContent side="bottom" className="h-[88vh] rounded-t-3xl overflow-hidden">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>Edit Profile
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={s.handleProfileUpdate} className="mt-2 space-y-4 overflow-y-auto pb-8">
                        {[
                            { icon: User, label: "Full Name", val: s.profileName, set: s.setProfileName },
                            { icon: Phone, label: "Phone Number", val: s.profilePhone, set: s.setProfilePhone, type: "tel" },
                            { icon: MapPin, label: "Address", val: s.profileAddress, set: s.setProfileAddress },
                            { icon: Globe, label: "Nationality", val: s.profileNationality, set: s.setProfileNationality },
                            { icon: User, label: "Gender", val: s.profileGender, set: s.setProfileGender, ph: "Male / Female / Other" },
                        ].map(({ icon: I, label, val, set, type, ph }) => (
                            <div key={label} className="space-y-2">
                                <label className="text-xs font-semibold">{label}</label>
                                <div className="relative">
                                    <I className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type={type || "text"} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="pl-11 h-12 rounded-xl" />
                                </div>
                            </div>
                        ))}
                        <Separator className="my-4" />
                        <Button type="submit" className="w-full h-12 rounded-xl font-semibold" disabled={s.loading}>
                            {s.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="mr-2 h-4 w-4" />Save Changes</>}
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export const LoggedInView = memo(LoggedInViewInner);
