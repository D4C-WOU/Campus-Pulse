import api from "@/lib/axios";

export const getAuditLogs = async (page = 1, limit = 10) => {
  const res = await api.get("/api/audit-logs/", {
    params: { page, limit },
  });

  return res.data;
};
