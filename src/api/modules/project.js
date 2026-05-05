import api from "../api";

const projectApi = {

    CREATE_PROJECT_INITIATION: (data) => api.post("/projects/initiations", data),
    GET_PROJECT_INITIATIONS: (params) => api.get("/projects/initiations", { params }),
    GET_PROJECT_INITIATION: (id) => api.get(`/projects/initiations/${id}`),
    UPDATE_PROJECT_INITIATION: (id, data) => api.put(`/projects/initiations/${id}`, data),
    DELETE_PROJECT_INITIATION: (id) => api.delete(`/projects/initiations/${id}`),


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
    EXTEND_PROJECT: (id, data) => api.post(`/projects/${id}/extend`, data),
    DELETE_EXTENSION: (projectId, extensionId) => api.delete(`/projects/${projectId}/extensions/${extensionId}`),



    GET_INSPECTION_LOGS: (params) => api.get("/admin/inspections", { params }),

    GET_INSPECTION_LOG: (id) => api.get(`/admin/inspections/${id}`),

    CREATE_INSPECTION_LOG: (formData) => api.post("/admin/inspections", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    UPDATE_INSPECTION_LOG: (id, formData) => api.put(`/admin/inspections/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    DELETE_INSPECTION_LOG: (id) => api.delete(`/admin/inspections/${id}`),

    // projectApi.js
    COMMENT_INSPECTION: (id, comment) => api.put(`/admin/inspections/comment/${id}`, comment, {
        headers: { 'Content-Type': 'text/plain' }
    }),

    DELETE_INSPECTION_LOG: (id) => api.delete(`/admin/inspections/${id}`),
    GET_TASKS_BY_PROJECT: (projectId) => api.get(`/tasks/project/${projectId}`),

    // Project Cost Transactional APIs
    // Project Cost History
    GET_PROJECT_COST_HISTORY: (projectId) => api.get(`/projects/${projectId}/costs`),
    ADD_PROJECT_COST: (data) => api.post("/projects/costs", data),
    UPDATE_PROJECT_COST: (id, data) => api.put(`/projects/costs/${id}`, data), // Added for editing
    DELETE_PROJECT_COST: (id) => api.delete(`/projects/costs/${id}`),
};

export default projectApi;