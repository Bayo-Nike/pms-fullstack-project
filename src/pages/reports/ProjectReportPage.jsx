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

      const projectData = res.data.data || [];
      // const employeesData = res.data || [];
      const transformed = projectData.content.map((proj, index) => {
        let timelineStatus = "N/A";
        let isOverdue = false;
        let extendedDays = proj.extendedDays || 0;
      
        let endDateDisplay = "N/A";
        let finalEndDate = null;
      
        if (proj.endDate) {
          const today = new Date();
          const originalEnd = new Date(proj.endDate);
      
          today.setHours(0, 0, 0, 0);
          originalEnd.setHours(0, 0, 0, 0);
      
          // apply extension
          const finalEnd = new Date(originalEnd);
          finalEnd.setDate(finalEnd.getDate() + extendedDays);
          finalEndDate = finalEnd.toLocaleDateString();
      
          // timeline calc (based on final date)
          const diffTime = finalEnd - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
          if (diffDays > 0) {
            timelineStatus = `${diffDays} days left`;
          } else if (diffDays < 0) {
            timelineStatus = `${Math.abs(diffDays)} days overdue`;
            isOverdue = true;
          } else {
            timelineStatus = "Due today";
          }
      
          // THIS is what you wanted for export
          const formatDate = (date) =>
            new Date(date).toLocaleDateString(); // or ISO if you prefer
          
          endDateDisplay =
            extendedDays > 0
              ? `${formatDate(originalEnd)} (+${extendedDays}d -> ${formatDate(finalEnd)})`
              : formatDate(originalEnd);
        }
      
        return {
          sno: index + 1,
          projectCode: proj.projectCode,
          title: proj.title,
          subCityName: proj.subCityName || "N/A",
          projectType: proj.projectType || "N/A",
          startDate: proj.startDate || "N/A",
      
          // Use formatted field for export
          endDate: endDateDisplay,
      
          extendedDays,
          finalEndDate,
          projectManagerName: proj.projectManagerName,
          employeeNames: proj.employeeNames,
          status: proj.status,
          projectProgress:
            proj.projectProgress != null
              ? Number(proj.projectProgress).toFixed(2) + " %"
              : "N/A",
          budget: `${proj.budgetUsed || "-"} / ${proj.budget || "N/A"} ${proj.currencyType}`,
          timelineStatus,
          isOverdue,
        };
      });
      
      setProjects(transformed);


    } catch (err) {

      console.error("Report fetch error:", err);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchProjects();

  }, []);

  return (
    <ProjectReport
      data={projects}
      loading={loading}
      onRefresh={fetchProjects}
    />
  );

}
