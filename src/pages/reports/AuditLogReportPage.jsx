import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import AuditLogReport from "./AuditLogReport";

export default function AuditLogReportPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.GET_AUDIT_LOGS();
      const logsData = res.data.data?.content || [];
  
      const transformed = logsData.map((log, index) => ({
        sno: index + 1,
        action: log.action || "N/A",
        performedBy: log.performedBy || "SYSTEM",
        timestamp: log.timestamp
          ? new Date(log.timestamp).toLocaleString()
          : "N/A",
        details: log.details || "N/A"
      }));
  
      setLogs(transformed);
    } catch (err) {
      console.error("AuditLog fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <AuditLogReport
      data={logs}
      loading={loading}
      onRefresh={fetchAuditLogs}
    />
  );
}