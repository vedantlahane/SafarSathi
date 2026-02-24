import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { updateTouristProfile } from "@/lib/api";
import { saveSession } from "@/lib/session";
import { hapticFeedback } from "@/lib/store";
import type { TouristProfile } from "@/lib/api";

interface ProfileEditorOptions {
  touristId?: string;
  token?: string;
  sessionName?: string;
  sessionEmail?: string;
  idHash?: string;
  profile: TouristProfile | null;
  setProfile: (profile: TouristProfile) => void;
  setLoading: (value: boolean) => void;
  showMsg: (type: "success" | "error", text: string) => void;
}

export function useProfileEditor(options: ProfileEditorOptions) {
  const {
    touristId,
    token,
    sessionName,
    sessionEmail,
    idHash,
    profile,
    setProfile,
    setLoading,
    showMsg,
  } = options;

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileNationality, setProfileNationality] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setProfileName(profile.name ?? "");
    setProfilePhone(profile.phone ?? "");
    setProfileAddress(profile.address ?? "");
    setProfileNationality(profile.nationality ?? "");
    setProfileGender(profile.gender ?? "");
  }, [profile]);

  const handleProfileUpdate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!touristId) return;
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
        const updated = await updateTouristProfile(touristId, payload);
        setProfile(updated);
        saveSession({
          touristId,
          token: token ?? "",
          name: updated.name || sessionName || "",
          email: updated.email || sessionEmail || "",
          idHash: updated.idHash || idHash,
        });
        showMsg("success", "Profile updated");
        setShowProfileEdit(false);
        hapticFeedback("medium");
      } catch (err) {
        showMsg("error", err instanceof Error ? err.message : "Update failed");
        hapticFeedback("heavy");
      } finally {
        setLoading(false);
      }
    },
    [
      touristId,
      profileName,
      profilePhone,
      profileAddress,
      profileNationality,
      profileGender,
      sessionName,
      sessionEmail,
      idHash,
      token,
      setLoading,
      setProfile,
      showMsg,
    ]
  );

  return {
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileAddress,
    setProfileAddress,
    profileNationality,
    setProfileNationality,
    profileGender,
    setProfileGender,
    showProfileEdit,
    setShowProfileEdit,
    handleProfileUpdate,
  };
}
