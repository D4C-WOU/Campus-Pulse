import api from "@/lib/axios";

export const getNotifications = async () => {
  const res = await api.get("/api/notifications/");
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch("/api/notifications/read-all");
  return res.data;
};
