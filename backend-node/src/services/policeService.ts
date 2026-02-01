import { randomUUID } from "crypto";
import { sha256 } from "../utils/hash.js";
import {
  getAllPoliceDepartments,
  getPoliceDepartmentById,
  createPoliceDepartment as createDept,
  updatePoliceDepartment as updateDept,
  deletePoliceDepartment as deleteDept,
  type IPoliceDepartment,
} from "./mongoStore.js";

export async function createPoliceDepartment(payload: Partial<IPoliceDepartment> & { passwordHash: string }) {
  return createDept({
    ...payload,
    _id: randomUUID(),
    passwordHash: sha256(payload.passwordHash),
  });
}

export async function listPoliceDepartments() {
  return getAllPoliceDepartments();
}

export async function getPoliceDepartment(id: string) {
  return getPoliceDepartmentById(id);
}

export async function updatePoliceDepartment(id: string, payload: Partial<IPoliceDepartment>) {
  return updateDept(id, payload);
}

export async function deletePoliceDepartment(id: string) {
  return deleteDept(id);
}
