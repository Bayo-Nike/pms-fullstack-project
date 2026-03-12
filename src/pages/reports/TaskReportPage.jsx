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
      const transformedTasks = (pageData?.content || []).map(task => ({
        id: task.id,
        taskName: task.taskName,
        project: task.projectTitle || `Project ID: ${task.projectId}`,
        employees: (task.employeeIds || []).join(", "),
    // .map(eid => projectStaff.find(emp => emp.id === eid)?.fullName)
    // .filter(Boolean)
    // .join(", "),
        startDate: task.startDate || "N/A",
        endDate: task.endDate || "N/A",
        status: task.status || "N/A",
        priority: task.priority || "N/A",
        weight: task.weight ?? "N/A",
        locations: (task.locationNames || []).join(", ")
      }));

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
