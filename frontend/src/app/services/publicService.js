import api from "@/lib/axios";

export const checkAlertStatus = async (reference) => {
  const res = await api.get(`/api/public/alerts/${reference}`);
  return res.data;
};

export const getLatestPublicAlerts = async (limit = 3) => {
  const res = await api.get("/api/public/latest-alerts", {
    params: { limit },
  });

  return res.data;
};
