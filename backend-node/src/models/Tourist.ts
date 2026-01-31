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
  emergencyContact?: string;
  passwordHash: string;
  idHash: string;
  idExpiry?: string;
  currentLat?: number;
  currentLng?: number;
  lastSeen?: string;
  safetyScore?: number;
}
