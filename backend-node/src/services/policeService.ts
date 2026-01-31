import type { PoliceDepartment } from "../models/PoliceDepartment.js";
import { policeDepartments } from "./dataStore.js";
import { generateId } from "../utils/id.js";

export function createPoliceDepartment(payload: Omit<PoliceDepartment, "id">) {
  const dept: PoliceDepartment = { id: generateId("police"), ...payload };
  policeDepartments.push(dept);
  return dept;
}

export function listPoliceDepartments() {
  return policeDepartments;
}

export function getPoliceDepartment(id: string) {
  return policeDepartments.find((d) => d.id === id);
}

export function updatePoliceDepartment(id: string, payload: Partial<PoliceDepartment>) {
  const dept = policeDepartments.find((d) => d.id === id);
  if (!dept) {
    return null;
  }
  Object.assign(dept, payload);
  return dept;
}

export function deletePoliceDepartment(id: string) {
  const index = policeDepartments.findIndex((d) => d.id === id);
  if (index === -1) {
    return false;
  }
  policeDepartments.splice(index, 1);
  return true;
}
