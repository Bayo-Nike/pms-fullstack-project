import React, { useEffect, useMemo, useState } from "react";
import taskApi from "../../api/modules/task";
import TaskReport from "./TaskReport";
import { exportToExcel, exportToPDF } from "../../utility/exportUtils";

export default function TaskReportPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [teamSearch, setTeamSearch] = useState('');

  const projectStaff = useMemo(() => {
          if (!project) return [];
          return project.employeeIds.map((eid, i) => ({ id: eid, fullName: project.employeeNames[i] }))
              .filter(e => e.fullName.toLowerCase().includes(teamSearch.toLowerCase()));
      }, [project, teamSearch]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskApi.GET_TASKS({ page: 0, size: 1000 });
      const pageData = res.data.data;

      // Transform for display/export
      const transformedTasks = (pageData?.content || []).map((task, index) => {
        // 1. Setup Dates
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day calculation
      
        const deadline = task.endDate ? new Date(task.endDate) : null;
        let deadlineLabel = "N/A";
        let isOverdue = false;
        // 2. Calculate Difference
        if (deadline && !isNaN(deadline)) {
          deadline.setHours(0, 0, 0, 0);
          // Difference in milliseconds converted to days
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
          if (diffDays > 0) {
            deadlineLabel = `${diffDays} days left`;
          } else if (diffDays < 0) {
            deadlineLabel = `${Math.abs(diffDays)} days overdue`;
            isOverdue = true;
          } else {
            deadlineLabel = "Due today";
          }
        }
        // 3. Return transformed object
        return {
          sno: index + 1,
          id: task.id,
          taskName: task.taskName,
          project: task.projectTitle || `Project ID: ${task.projectId}`,
          employees: (task.employeeNames || []).join(", "),
          startDate: task.startDate || "N/A",
          endDate: task.endDate || "N/A",
          // both fields for timeline
          deadlineStatus: deadlineLabel,
          isOverdue: isOverdue, 
          status: task.status || "N/A",
          priority: task.priority || "N/A",
          weight: task.weight ?? "N/A",
          locations: (task.locationNames || []).join(", ")
        };
      });
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error("Task fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  


  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>

      <TaskReport data={tasks} loading={loading} onRefresh={fetchTasks} />
    </div>
  );
}
