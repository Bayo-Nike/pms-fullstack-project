import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import EmployeeReport from "./EmployeeReport";

export default function EmployeeReportPage() {

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {

    setLoading(true);

    try {

      const res = await adminApi.GET_EMPLOYEES();
 
      const employeesData = res.data || [];

      const transformed = employeesData.map((emp, index) => ({
        sno: index + 1,
        fullName: emp.fullName,
        email: emp.email,
        division: emp.divisionName || "N/A",
        position: emp.positionName || "N/A",
        location: `${emp.cityName || "N/A"}${emp.subCityName ? " / " + emp.subCityName : ""}`,
        status: emp.status,
        projectCount: emp.projectCount || 0,
        taskCount: emp.taskCount || 0
      }));

      setEmployees(transformed);

    } catch (err) {
      console.error("Employee fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <EmployeeReport
      data={employees}
      loading={loading}
      onRefresh={fetchEmployees}
    />
  );
}