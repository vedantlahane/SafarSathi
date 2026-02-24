import { useCallback, useEffect, useMemo, useState } from "react";
import { updateTouristProfile } from "@/lib/api";
import { hapticFeedback } from "@/lib/store";
import type { TouristProfile } from "@/lib/api";

interface EmergencyEditorOptions {
  touristId?: string;
  profile: TouristProfile | null;
  setProfile: (profile: TouristProfile) => void;
  setLoading: (value: boolean) => void;
  showMsg: (type: "success" | "error", text: string) => void;
}

function parseList(input: string): string[] {
  return input
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidPhone(input: string): boolean {
  return input.replace(/\D/g, "").length >= 8;
}

export function useEmergencyEditor(options: EmergencyEditorOptions) {
  const { touristId, profile, setProfile, setLoading, showMsg } = options;

  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");

  const [showEmergencyContact, setShowEmergencyContact] = useState(false);
  const [showBloodType, setShowBloodType] = useState(false);
  const [showAllergies, setShowAllergies] = useState(false);
  const [showMedical, setShowMedical] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setEmergencyContactName(profile.emergencyContact?.name ?? "");
    setEmergencyContactPhone(profile.emergencyContact?.phone ?? "");
    setBloodType(profile.bloodType ?? "");
    setAllergies(profile.allergies?.join(", ") ?? "");
    setMedicalConditions(profile.medicalConditions?.join(", ") ?? "");
  }, [profile]);

  const canSaveEmergencyContact = useMemo(
    () => isValidPhone(emergencyContactPhone),
    [emergencyContactPhone]
  );

  const saveEmergencyContact = useCallback(async () => {
    if (!touristId) return;
    if (!isValidPhone(emergencyContactPhone)) {
      showMsg("error", "Enter a valid emergency phone number");
      return;
    }
    hapticFeedback("light");
    setLoading(true);
    try {
      const updated = await updateTouristProfile(touristId, {
        emergencyContact: {
          name: emergencyContactName,
          phone: emergencyContactPhone,
        },
      });
      setProfile(updated);
      showMsg("success", "Emergency contact saved");
      setShowEmergencyContact(false);
      hapticFeedback("medium");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Update failed");
      hapticFeedback("heavy");
    } finally {
      setLoading(false);
    }
  }, [
    touristId,
    emergencyContactName,
    emergencyContactPhone,
    setLoading,
    setProfile,
    showMsg,
  ]);

  const saveBloodType = useCallback(async () => {
    if (!touristId) return;
    hapticFeedback("light");
    setLoading(true);
    try {
      const updated = await updateTouristProfile(touristId, { bloodType });
      setProfile(updated);
      showMsg("success", "Blood type saved");
      setShowBloodType(false);
      hapticFeedback("medium");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Update failed");
      hapticFeedback("heavy");
    } finally {
      setLoading(false);
    }
  }, [touristId, bloodType, setLoading, setProfile, showMsg]);

  const saveAllergies = useCallback(async () => {
    if (!touristId) return;
    hapticFeedback("light");
    setLoading(true);
    try {
      const updated = await updateTouristProfile(touristId, {
        allergies: parseList(allergies),
      });
      setProfile(updated);
      showMsg("success", "Allergies saved");
      setShowAllergies(false);
      hapticFeedback("medium");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Update failed");
      hapticFeedback("heavy");
    } finally {
      setLoading(false);
    }
  }, [touristId, allergies, setLoading, setProfile, showMsg]);

  const saveMedicalConditions = useCallback(async () => {
    if (!touristId) return;
    hapticFeedback("light");
    setLoading(true);
    try {
      const updated = await updateTouristProfile(touristId, {
        medicalConditions: parseList(medicalConditions),
      });
      setProfile(updated);
      showMsg("success", "Medical conditions saved");
      setShowMedical(false);
      hapticFeedback("medium");
    } catch (err) {
      showMsg("error", err instanceof Error ? err.message : "Update failed");
      hapticFeedback("heavy");
    } finally {
      setLoading(false);
    }
  }, [touristId, medicalConditions, setLoading, setProfile, showMsg]);

  return {
    emergencyContactName,
    setEmergencyContactName,
    emergencyContactPhone,
    setEmergencyContactPhone,
    bloodType,
    setBloodType,
    allergies,
    setAllergies,
    medicalConditions,
    setMedicalConditions,
    showEmergencyContact,
    setShowEmergencyContact,
    showBloodType,
    setShowBloodType,
    showAllergies,
    setShowAllergies,
    showMedical,
    setShowMedical,
    canSaveEmergencyContact,
    saveEmergencyContact,
    saveBloodType,
    saveAllergies,
    saveMedicalConditions,
  };
}
