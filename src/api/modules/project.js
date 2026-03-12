import api from "../api";

const projectApi = {
    GET_PROJECTS: (params) => api.get("/projects", { params }),
    GET_MY_PROJECTS: (params) => api.get("/projects/my", { params }),
    GET_PROJECT: (id) => api.get(`/projects/${id}`),
    CREATE_PROJECT: (data) => api.post("/projects", data),
    UPDATE_PROJECT: (id, data) => api.put(`/projects/${id}`, data),
    DELETE_PROJECT: (id) => api.delete(`/projects/${id}`),
    UPDATE_STATUS: (id, status) => api.patch(`/projects/${id}/status`, null, { params: { status } }),
    UPDATE_PRIORITY: (id, priority) => api.patch(`/projects/${id}/priority`, null, { params: { priority } }),
    ASSIGN_MANAGER: (id, projectManagerId) => api.patch(`/projects/${id}/manager`, null, { params: { projectManagerId } }),
    ASSIGN_EMPLOYEES: (id, employeeIds) => api.patch(`/projects/${id}/employees`, employeeIds),
    UPDATE_BUDGET: (id, budget, budgetUsed) => api.patch(`/projects/${id}/budget`, null, { params: { budget, budgetUsed } }),
    UPDATE_TIMELINE: (id, startDate, endDate) => api.patch(`/projects/${id}/timeline`, null, { params: { startDate, endDate } }),



    // Additional endpoints for project-specific data
    GET_INSPECTION_LOGS: (params) => api.get("/admin/inspections", { params }),
    GET_INSPECTION_LOG: (id) => api.get(`/admin/inspections/${id}`),
    CREATE_INSPECTION_LOG: (data) => api.post("/admin/inspections", data),
    UPDATE_INSPECTION_LOG: (id, data) => api.put(`/admin/inspections/${id}`, data),
    DELETE_INSPECTION_LOG: (id) => api.delete(`/admin/inspections/${id}`),
    GET_TASKS_BY_PROJECT: (projectId) => api.get(`/tasks/project/${projectId}`),
};

export default projectApi;