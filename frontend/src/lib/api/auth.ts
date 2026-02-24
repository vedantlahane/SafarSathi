import { request } from "./client";

export async function requestPasswordReset(email: string) {
  return request<{ acknowledged: boolean }>("/api/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(token: string, password: string) {
  return request<{ acknowledged: boolean }>("/api/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function biometricRegisterOptions() {
  return request<unknown>("/api/auth/biometric/register/options", {
    method: "POST",
  });
}

export async function biometricRegisterVerify(response: unknown) {
  return request<{ acknowledged: boolean }>("/api/auth/biometric/register/verify", {
    method: "POST",
    body: JSON.stringify(response),
  });
}

export async function biometricLoginOptions(email: string) {
  return request<{ options: unknown; touristId: string }>("/api/auth/biometric/login/options", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function biometricLoginVerify(payload: { touristId: string; response: unknown }) {
  return request<{ touristId: string; token: string; user: { name: string; email: string; idHash?: string } }>(
    "/api/auth/biometric/login/verify",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
