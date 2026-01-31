export interface Alert {
  id: string;
  touristId: string;
  message: string;
  status: "open" | "acknowledged" | "resolved";
  createdAt: string;
}
