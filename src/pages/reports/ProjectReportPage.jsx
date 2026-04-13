import React, { useEffect, useState } from "react";
import projectApi from "../../api/modules/project";
import ProjectReport from "./ProjectReport";

export default function ProjectReportPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectApi.GET_PROJECTS({ page: 0, size: 1000 });
      const projectData = res.data?.data?.content || res.data?.content || [];

      const transformed = projectData.map((proj, index) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        
        // 1. Extension Logic
        const extensions = proj.extensions || [];
        const totalExtendedDays = extensions.reduce((sum, ext) => sum + (Number(ext.extendedDays) || 0), 0);

        // 2. Deadline Logic
        const originalEnd = proj.endDate ? new Date(proj.endDate) : null;
        let finalEnd = null;
        let diffDays = null;

        if (originalEnd) {
          finalEnd = new Date(originalEnd);
          finalEnd.setDate(finalEnd.getDate() + totalExtendedDays);
          diffDays = Math.ceil((finalEnd - today) / (1000 * 60 * 60 * 24));
        }

        // THIS IS THE FIELD FOR EXCEL/PDF
        const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';
        const originalStr = formatDate(proj.endDate);
        const finalStr = formatDate(finalEnd);

        // THIS STRING IS FOR EXCEL & PDF
        const projectDeadlineExport = totalExtendedDays > 0
          ? `Orig: ${originalStr} -> Revised: ${finalStr} (+${totalExtendedDays} Days)`
          : originalStr;

        // Budget Part for Export
        const budget = proj.budget || 0;
        const used = proj.budgetUsed || 0;
        const currency = proj.currencyType || "ETB";
        // Calculate percentage spent
        const percentSpent = budget > 0 ? ((used / budget) * 100).toFixed(1) : 0;
        // THIS IS THE STRING FOR EXCEL/PDF
        const financialSummary = `${used.toLocaleString()} / ${budget.toLocaleString()} ${currency} (${percentSpent}%)`;

        // 1. Calculate the Text for Export
        let timelineExport = "N/A";
        if (proj.status === "COMPLETED" || proj.status === "FINISHED") {
          timelineExport = "Completed";
        } else if (diffDays !== null) {
          if (diffDays > 0) {
            timelineExport = `${diffDays} Days Left`;
          } else if (diffDays < 0) {
            timelineExport = `${Math.abs(diffDays)}d Overdue`;
          } else {
            timelineExport = "Due Today";
          }
        }

        return {
          sno: index + 1,
          projectCode: proj.projectCode,
          title: proj.title,
          subCityName: proj.subCityName || "Global",
          projectType: proj.projectType || "N/A",
          startDate: proj.startDate,
          originalEndDate: proj.endDate,
          finalEndDate: finalEnd ? finalEnd.toISOString().split('T')[0] : null,
          totalExtendedDays,
          diffDays,

          // Use formatted field for export
          projectDeadlineExport: projectDeadlineExport,
          percentSpent,
          financialSummary,
          timelineExport,

          projectManagerName: proj.projectManagerName || "Unassigned",
          employeeNames: proj.employeeNames || [], // Keep as array for UI mapping
          status: proj.status || "NOT_STARTED",
          projectProgress:
            proj.projectProgress != null
              ? Number(proj.projectProgress).toFixed(2) + " %"
              : "N/A",
          budget: proj.budget || 0,
          budgetUsed: proj.budgetUsed || 0,
          currency: proj.currencyType || "ETB",
        };
      });

      setProjects(transformed);
    } catch (err) {
      console.error("Report fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  return <ProjectReport data={projects} loading={loading} onRefresh={fetchProjects} />;
}