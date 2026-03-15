import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin";
import DivisionReport from "./DivisionReport";

export default function DivisionReportPage() {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDivisions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.GET_DIVISIONS();
      const divisionsData = res.data || [];
      

      const transformed = divisionsData.map((div, index) => {
        const children = div.children || [];
        return {
          sno: index + 1,
          divisionName: div.name || "N/A",
          parentDivision: div.parentName || "N/A",
          childCount: children.length,
          childList: children.map(c => c.name).join(", ")
        };
      });

      setDivisions(transformed);
    } catch (err) {
      console.error("Division fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDivisions();
  }, []);

  return (
    <DivisionReport
      data={divisions}
      loading={loading}
      onRefresh={fetchDivisions}
    />
  );
}