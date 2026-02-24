import { RegisterStep1 } from "./register-step-1";
import { RegisterStep2 } from "./register-step-2";
import { RegisterStep3 } from "./register-step-3";
import type { PasswordCheck, RegisterStep } from "../types";

interface RegisterFormProps {
  step: RegisterStep;
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
  passwordStatus: PasswordCheck;
  canProceedStep1: boolean;
  canProceedStep2: boolean;
  canProceedStep3: boolean;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function RegisterForm(props: RegisterFormProps) {
  if (props.step === 1) {
    return (
      <RegisterStep1
        name={props.name}
        email={props.email}
        password={props.password}
        passwordStatus={props.passwordStatus}
        canContinue={props.canProceedStep1}
        onChange={(field, value) => props.onChange(field, value)}
        onNext={props.onNext}
      />
    );
  }

  if (props.step === 2) {
    return (
      <RegisterStep2
        phone={props.phone}
        nationality={props.nationality}
        passportNumber={props.passportNumber}
        canContinue={props.canProceedStep2}
        onChange={(field, value) => props.onChange(field, value)}
        onNext={props.onNext}
        onBack={props.onBack}
      />
    );
  }

  return (
    <RegisterStep3
      emergencyName={props.emergencyName}
      emergencyPhone={props.emergencyPhone}
      bloodType={props.bloodType}
      allergies={props.allergies}
      medicalConditions={props.medicalConditions}
      canContinue={props.canProceedStep3}
      onChange={(field, value) => props.onChange(field, value)}
      onBack={props.onBack}
      onSubmit={props.onSubmit}
    />
  );
}
