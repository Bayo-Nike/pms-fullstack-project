import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import ModuleReport from "./ModuleReport";

export default function ModuleReportPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await adminApi.GET_MODULES();
      const modulesData = res.data || [];

      const transformed = modulesData.map((mod, index) => {
        const permissions = mod.permissions || [];
        return {
          sno: index + 1,
          moduleName: mod.name || "N/A",
          permissionCount: permissions.length,
          permissions: permissions.map(p => p.name).join(", ")
        };
      });

      setModules(transformed);
    } catch (err) {
      console.error("Module fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return (
    <ModuleReport data={modules} loading={loading} onRefresh={fetchModules} />
  );
}