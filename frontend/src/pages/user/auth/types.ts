export type AuthMode = "login" | "register" | "success";
export type RegisterStep = 1 | 2 | 3;

export interface PasswordCheck {
  minLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
}

export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
}
