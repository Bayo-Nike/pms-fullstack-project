import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import UserReport from "./UserReport";

export default function UserReportPage() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {

    setLoading(true);

    try {

      const res = await adminApi.GET_USERS();

      const usersData = res.data || []; 
      
      const transformed = usersData.map((user, index) => {

        const employee = user.employee;
        const roles = user.roles || [];

        // Flatten permissions from all roles
        const permissionNames = [
            ...new Set(
            roles.flatMap(r => (r.permissions || []).map(p => p.name))
            )
        ];

        return {
          sno: index + 1,
          username: user.username,
          email: user.email,
          userType: user.userType,

          employeeName: user.fullName || "SYSTEM USER",

          location: employee
            ? `${employee.cityName || ""}${employee.subCity ? " / " + employee.subCityName : ""}`
            : "N/A",

          status: employee?.status || "SYSTEM",

          roles: (user.roles || [])
            .map(r => r.roleName)
            .join(", "),

          roleCount: user.roles?.length || 0,
          permissions: permissionNames.join(", "),
          permissionCount: permissionNames.length
        };

      });

      setUsers(transformed);

    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserReport
      data={users}
      loading={loading}
      onRefresh={fetchUsers}
    />
  );
}