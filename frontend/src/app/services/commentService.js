import api from "@/lib/axios";

export const getComments = async (alertId) => {
  const res = await api.get(`/api/alerts/${alertId}/comments`);
  return res.data;
};

export const postComment = async (alertId, comment) => {
  const res = await api.post(`/api/alerts/${alertId}/comments`, { comment });
  return res.data;
};
