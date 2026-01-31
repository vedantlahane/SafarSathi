import type { PoliceDepartment } from "../models/PoliceDepartment.js";
import { policeDepartments, saveStore } from "./dataStore.js";
import { randomUUID } from "crypto";
import { sha256 } from "../utils/hash.js";

export function createPoliceDepartment(payload: Omit<PoliceDepartment, "id">) {
  const dept: PoliceDepartment = {
    ...payload,
    id: randomUUID(),
    passwordHash: sha256(payload.passwordHash)
  };
  policeDepartments.push(dept);
  saveStore();
  return dept;
}

export function listPoliceDepartments() {
  return policeDepartments;
}

export function getPoliceDepartment(id: string) {
  return policeDepartments.find((d) => d.id === id) ?? null;
}

export function updatePoliceDepartment(id: string, payload: Partial<PoliceDepartment>) {
  const dept = policeDepartments.find((d) => d.id === id);
  if (!dept) {
    return null;
  }
  dept.name = payload.name ?? dept.name;
  dept.email = payload.email ?? dept.email;
  dept.departmentCode = payload.departmentCode ?? dept.departmentCode;
  dept.latitude = payload.latitude ?? dept.latitude;
  dept.longitude = payload.longitude ?? dept.longitude;
  dept.city = payload.city ?? dept.city;
  dept.district = payload.district ?? dept.district;
  dept.state = payload.state ?? dept.state;
  dept.contactNumber = payload.contactNumber ?? dept.contactNumber;
  dept.isActive = payload.isActive ?? dept.isActive;
  saveStore();
  return dept;
}

export function deletePoliceDepartment(id: string) {
  const index = policeDepartments.findIndex((d) => d.id === id);
  if (index === -1) {
    return false;
  }
  policeDepartments.splice(index, 1);
  saveStore();
  return true;
}
