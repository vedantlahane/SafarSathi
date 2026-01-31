export interface PoliceDepartment {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  departmentCode: string;
  latitude: number;
  longitude: number;
  city: string;
  district: string;
  state: string;
  contactNumber: string;
  isActive?: boolean;
}
