import api from "@/lib/axios";

// Get all alerts
export const getAlerts = async (page = 1, limit = 20, status = null) => {
  const params = { page, limit };
  if (status) params.status = status;
  const res = await api.get("/api/alerts/", { params });
  return res.data; // { items, page, limit, total, pages }
};
// Get single alert
export const getAlertById = async (id) => {
  const res = await api.get(`/api/alerts/${id}`);
  return res.data;
};

// Create alert
export const createAlert = async (payload) => {
  const res = await api.post("/api/alerts/", payload);
  return res.data;
};

// Investigate alert
export const investigateAlert = async (id) => {
  const res = await api.patch(`/api/alerts/${id}/investigate`);
  return res.data;
};

// Resolve alert
export const resolveAlert = async (id) => {
  const res = await api.patch(`/api/alerts/${id}/resolve`);
  return res.data;
};

// Mark false report
export const markFalseReport = async (id) => {
  const res = await api.patch(`/api/alerts/${id}/false-report`);
  return res.data;
};
