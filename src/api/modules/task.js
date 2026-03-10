import api from "../api";

const taskApi = {
    GET_TASKS_BY_PROJECT: (projectId) => api.get(`/tasks/project/${projectId}`),
    CREATE_TASK: (data) => api.post("/tasks", data),
    UPDATE_TASK: (id, data) => api.put(`/tasks/${id}`, data),
    DELETE_TASK: (id) => api.delete(`/tasks/${id}`),
};

export default taskApi;