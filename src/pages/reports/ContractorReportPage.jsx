import React, { useEffect, useState } from "react";
import adminApi from "../../api/modules/admin"; // adjust your API import
import ContractorReport from "./ContractorReport";

export default function ContractorReportPage() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const res = await adminApi.GET_CONTRACTORS(); // Replace with your API
      const contractorsData = res.data || [];

      const transformed = contractorsData.map((c, index) => ({
        sno: index + 1,
        contractorName: c.contractorName || "N/A",
        status: c.status || "N/A",
        document: c.document || "N/A",
        createdDate: c.createdDate
          ? new Date(c.createdDate).toLocaleString()
          : "N/A"
      }));

      setContractors(transformed);
    } catch (err) {
      console.error("Contractor fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  return (
    <ContractorReport
      data={contractors}
      loading={loading}
      onRefresh={fetchContractors}
    />
  );
}