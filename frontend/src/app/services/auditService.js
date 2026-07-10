import api from "@/lib/axios";

// Matches the backend's GET /api/audit-logs/ (super_admin only --
// the 403 case is handled by the calling page, not here).
export const getAuditLogs = async () => {
  const res = await api.get("/api/audit-logs/");
  return res.data;
};
