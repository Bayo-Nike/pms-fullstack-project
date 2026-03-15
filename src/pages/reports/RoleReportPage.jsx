import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import RoleReport from "./RoleReport";

export default function RoleReportPage() {

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    setLoading(true);
  
    try {
      const res = await adminApi.GET_ROLES();
  
      const rolesData = res.data || [];

      const transformed = rolesData.map((role, index) => ({
        sno: index + 1,
        roleName: role.roleName,
        description: role.description || "N/A",
        permissions: (role.permissions || [])
        .map(p => p.name)
        .join(", "),
        permissionCount: role.permissions?.length || 0
      }));
  
      setRoles(transformed);
  
    } catch (err) {
      console.error("Role fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <RoleReport
      data={roles}
      loading={loading}
      onRefresh={fetchRoles}
    />
  );
}