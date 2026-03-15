import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin"; // adjust API import
import PermissionReport from "./PermissionReport";

export default function PermissionReportPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.GET_PERMISSIONS();
      const permissionsData = res.data || [];

      console.log(permissionsData)
      const transformed = permissionsData.map((perm, index) => {
        const roles = perm.roleIds || [];
        return {
          sno: index + 1,
          permissionName: perm.name || "N/A",
          slug: perm.slug || "N/A",
          module: perm.moduleName || "N/A",
          roleCount: roles.length,
          roles: roles.map(r => r.roleName).join(", ")
        };
      });

      setPermissions(transformed);
    } catch (err) {
      console.error("Permission fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <PermissionReport
      data={permissions}
      loading={loading}
      onRefresh={fetchPermissions}
    />
  );
}