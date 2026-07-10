import api from "@/lib/axios";

// Matches the backend's GET /api/analytics/overview
export const getOverview = async () => {
  const res = await api.get("/api/analytics/overview");
  return res.data;
};
