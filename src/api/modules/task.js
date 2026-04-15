import api from "../api";

const taskApi = {
    GET_TASKS_BY_PROJECT: (projectId) => api.get(`/tasks/project/${projectId}`),
    GET_MY_TASKS: () => api.get("/tasks/my"),
    GET_TASK: (id) => api.get(`/tasks/${id}`),
    CREATE_TASK: (data) => api.post("/tasks", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }),
    UPDATE_TASK: (id, data) => api.put(`/tasks/${id}`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }),
    
    DELETE_TASK: (id) => api.delete(`/tasks/${id}`),
    GET_TASKS: (params) => api.get("/tasks", { params }),
};

export default taskApi;