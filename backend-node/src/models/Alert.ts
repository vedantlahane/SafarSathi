export interface Alert {
  id: number;
  touristId: string;
  alertType: string;
  lat?: number;
  lng?: number;
  status: string;
  message?: string;
  createdTime: string;
}
