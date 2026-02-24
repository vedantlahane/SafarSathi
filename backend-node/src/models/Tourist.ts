export interface Tourist {
  id: string;
  name: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  emergencyContact?: { name?: string; phone?: string };
  bloodType?: string;
  allergies?: string[];
  medicalConditions?: string[];
  passwordHash: string;
  idHash: string;
  idExpiry?: string;
  currentLat?: number;
  currentLng?: number;
  lastSeen?: string;
  safetyScore?: number;
}
