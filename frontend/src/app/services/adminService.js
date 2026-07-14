import api from "@/lib/axios";

export const getAdmins = async () => {
  const res = await api.get("/api/admins/");
  return res.data;
};

export const createAdmin = async (payload) => {
  const res = await api.post("/api/admins/", payload);
  return res.data;
};

export const deleteAdmin = async (adminId) => {
  const res = await api.delete(`/api/admins/${adminId}`);
  return res.data;
};
