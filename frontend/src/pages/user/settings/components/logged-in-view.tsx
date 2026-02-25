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
import { cn } from "@/lib/utils";
import { EditEmergencyContactSheet } from "./edit-emergency-contact-sheet";
import { EditBloodTypeSheet } from "./edit-blood-type-sheet";
import { EditAllergiesSheet } from "./edit-allergies-sheet";
import { EditMedicalSheet } from "./edit-medical-sheet";
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
                        emergencyContact={s.emergencyContactPhone}
                        bloodType={s.bloodType}
                        allergies={s.allergies}
                        medicalConditions={s.medicalConditions}
                        onEditEmergencyContact={() => s.setShowEmergencyContact(true)}
                        onEditBloodType={() => s.setShowBloodType(true)}
                        onEditAllergies={() => s.setShowAllergies(true)}
                        onEditMedicalConditions={() => s.setShowMedical(true)}
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
                <SheetContent
                    side="bottom"
                    className="h-[88vh] rounded-[32px] border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[40px] drop-shadow-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_24px_48px_rgba(0,0,0,0.2)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_24px_48px_rgba(0,0,0,0.6)] overflow-hidden"
                >
                    <SheetHeader className="pb-4">
                        <SheetTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>Edit Profile
                        </SheetTitle>
                    </SheetHeader>
                    <form onSubmit={s.handleProfileUpdate} className="mt-2 space-y-4 overflow-y-auto pb-8">
                        <div className="px-4">
                            <div className="overflow-hidden rounded-[24px] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                                {[
                                    { icon: User, label: "Full Name", val: s.profileName, set: s.setProfileName },
                                    { icon: Phone, label: "Phone Number", val: s.profilePhone, set: s.setProfilePhone, type: "tel" },
                                    { icon: MapPin, label: "Address", val: s.profileAddress, set: s.setProfileAddress },
                                    { icon: Globe, label: "Nationality", val: s.profileNationality, set: s.setProfileNationality },
                                    { icon: User, label: "Gender", val: s.profileGender, set: s.setProfileGender, ph: "Male / Female / Other" },
                                ].map(({ icon: I, label, val, set, type, ph }, idx, arr) => (
                                    <div key={label} className={cn(
                                        "relative flex items-center min-h-[64px] group transition-colors focus-within:bg-white/40 dark:focus-within:bg-slate-800/40",
                                        idx < arr.length - 1 && "border-b border-black/5 dark:border-white/5"
                                    )}>
                                        <div className="w-[52px] flex justify-center items-center">
                                            <I className="h-[20px] w-[20px] text-slate-400 group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center h-full py-1 pr-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none pt-2">{label}</label>
                                            <Input
                                                type={type || "text"}
                                                value={val}
                                                onChange={(e) => set(e.target.value)}
                                                placeholder={ph || "Enter value"}
                                                className="h-8 border-none bg-transparent shadow-none px-0 py-0 text-[16px] font-medium focus-visible:ring-0 placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 pb-4">
                            <Separator className="my-6 opacity-30" />
                            <Button type="submit" className="w-full h-14 rounded-2xl font-semibold shadow-[0_8px_16px_-4px_var(--theme-glow)] transition-all active:scale-[0.98]" disabled={s.loading}>
                                {s.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="mr-2 h-5 w-5 drop-shadow-sm" />Save Changes</>}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            <EditEmergencyContactSheet
                open={s.showEmergencyContact}
                onOpenChange={s.setShowEmergencyContact}
                name={s.emergencyContactName}
                phone={s.emergencyContactPhone}
                loading={s.loading}
                canSave={s.canSaveEmergencyContact}
                onNameChange={s.setEmergencyContactName}
                onPhoneChange={s.setEmergencyContactPhone}
                onSave={s.saveEmergencyContact}
            />

            <EditBloodTypeSheet
                open={s.showBloodType}
                onOpenChange={s.setShowBloodType}
                value={s.bloodType}
                loading={s.loading}
                onValueChange={s.setBloodType}
                onSave={s.saveBloodType}
            />

            <EditAllergiesSheet
                open={s.showAllergies}
                onOpenChange={s.setShowAllergies}
                value={s.allergies}
                loading={s.loading}
                onValueChange={s.setAllergies}
                onSave={s.saveAllergies}
            />

            <EditMedicalSheet
                open={s.showMedical}
                onOpenChange={s.setShowMedical}
                value={s.medicalConditions}
                loading={s.loading}
                onValueChange={s.setMedicalConditions}
                onSave={s.saveMedicalConditions}
            />
        </div>
    );
}

export const LoggedInView = memo(LoggedInViewInner);
