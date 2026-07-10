import api from "@/lib/axios";

// Get all alerts
export const getAlerts = async () => {
  const res = await api.get("/api/alerts/");
  return res.data;
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

// Acknowledge alert
export const acknowledgeAlert = async (id) => {
  const res = await api.patch(`/api/alerts/${id}/acknowledge`);
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
