import api from "@/lib/axios";

export const checkAlertStatus = async (reference) => {
  const res = await api.get(`/api/public/alerts/${reference}`);
  return res.data;
};
